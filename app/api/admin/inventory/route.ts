import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Fetch inventory alerts and restock history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const rewardId = searchParams.get('rewardId')

    if (action === 'low-stock') {
      // Get low stock items
      const { data, error } = await supabase
        .from('low_stock_rewards')
        .select('*')

      if (error) throw error
      return successResponse(data)
    }

    if (action === 'out-of-stock') {
      // Get out of stock items
      const { data, error } = await supabase
        .from('out_of_stock_rewards')
        .select('*')

      if (error) throw error
      return successResponse(data)
    }

    if (action === 'restock-history') {
      // Get restock history
      let query = supabase
        .from('restock_history')
        .select(`
          *,
          reward:rewards(name, category, tier)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (rewardId) {
        query = query.eq('reward_id', rewardId)
      }

      const { data, error } = await query

      if (error) throw error
      return successResponse(data)
    }

    if (action === 'alerts-summary') {
      // Get summary of all alerts
      const [lowStock, outOfStock] = await Promise.all([
        supabase.from('low_stock_rewards').select('*'),
        supabase.from('out_of_stock_rewards').select('*')
      ])

      return successResponse({
        lowStock: lowStock.data || [],
        outOfStock: outOfStock.data || [],
        lowStockCount: lowStock.data?.length || 0,
        outOfStockCount: outOfStock.data?.length || 0
      })
    }

    return errorResponse('Invalid action parameter', 400)
  } catch (error: any) {
    console.error('Error fetching inventory data:', error)
    return serverErrorResponse(error)
  }
}

// POST - Bulk update quantities or restock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, updates, rewardId, quantity, notes, restockedBy } = body

    if (action === 'bulk-update') {
      // Bulk update multiple rewards
      if (!updates || !Array.isArray(updates)) {
        return validationErrorResponse('Updates array is required')
      }

      const results = []
      const errors = []

      for (const update of updates) {
        const { id, quantity } = update

        if (!id || quantity === undefined) {
          errors.push({ id, error: 'ID and quantity are required' })
          continue
        }

        if (quantity < 0) {
          errors.push({ id, error: 'Quantity cannot be negative' })
          continue
        }

        try {
          const { data, error } = await supabase
            .from('rewards')
            .update({ quantity })
            .eq('id', id)
            .select('id, name, quantity')
            .single()

          if (error) throw error
          results.push(data)
        } catch (err: any) {
          errors.push({ id, error: err.message })
        }
      }

      return successResponse({
        success: results.length,
        failed: errors.length,
        results,
        errors
      }, `Bulk update completed: ${results.length} succeeded, ${errors.length} failed`)
    }

    if (action === 'restock') {
      // Restock a single item
      if (!rewardId) {
        return validationErrorResponse('Reward ID is required')
      }

      if (!quantity || quantity <= 0) {
        return validationErrorResponse('Quantity must be greater than 0')
      }

      // Get current reward
      const { data: reward, error: fetchError } = await supabase
        .from('rewards')
        .select('id, name, quantity')
        .eq('id', rewardId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return errorResponse('Reward not found', 404)
        }
        throw fetchError
      }

      const newQuantity = reward.quantity + quantity

      // Update reward quantity
      const { error: updateError } = await supabase
        .from('rewards')
        .update({ 
          quantity: newQuantity,
          last_restocked_at: new Date().toISOString()
        })
        .eq('id', rewardId)

      if (updateError) throw updateError

      // Log restock history
      const { error: historyError } = await supabase
        .from('restock_history')
        .insert({
          reward_id: rewardId,
          previous_quantity: reward.quantity,
          added_quantity: quantity,
          new_quantity: newQuantity,
          restocked_by: restockedBy || 'admin',
          notes: notes || null
        })

      if (historyError) throw historyError

      return successResponse({
        reward: reward.name,
        previousQuantity: reward.quantity,
        addedQuantity: quantity,
        newQuantity
      }, 'Restock successful')
    }

    if (action === 'set-threshold') {
      // Set low stock threshold for a reward
      if (!rewardId) {
        return validationErrorResponse('Reward ID is required')
      }

      const threshold = parseInt(body.threshold)
      if (isNaN(threshold) || threshold < 0) {
        return validationErrorResponse('Invalid threshold value')
      }

      const { error } = await supabase
        .from('rewards')
        .update({ low_stock_threshold: threshold })
        .eq('id', rewardId)

      if (error) throw error

      return successResponse(null, 'Threshold updated successfully')
    }

    if (action === 'toggle-active') {
      // Manually toggle active status
      if (!rewardId) {
        return validationErrorResponse('Reward ID is required')
      }

      const isActive = body.isActive
      if (typeof isActive !== 'boolean') {
        return validationErrorResponse('isActive must be a boolean')
      }

      const { error } = await supabase
        .from('rewards')
        .update({ is_active: isActive })
        .eq('id', rewardId)

      if (error) throw error

      return successResponse(null, `Reward ${isActive ? 'activated' : 'deactivated'} successfully`)
    }

    return errorResponse('Invalid action parameter', 400)
  } catch (error: any) {
    console.error('Error processing inventory action:', error)
    return serverErrorResponse(error)
  }
}
