import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateClaimInput, ValidationError } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse'

// POST - Submit a claim
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = validateClaimInput(body)

    // Generate claim ID
    const claimId = 'CLM-' + Math.random().toString(36).substr(2, 9).toUpperCase()

    // Check if database is ready
    const { data: testQuery, error: testError } = await supabase
      .from('claims')
      .select('id')
      .limit(1)
    
    // If tables don't exist yet, return mock success
    if (testError && testError.message.includes('relation')) {
      console.log('Database not ready, returning mock claim ID')
      return successResponse(
        { claimId },
        'Database not configured. This is a demo claim ID.'
      )
    }

    // Verify reward exists and has stock
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('id, name, quantity')
      .eq('id', validatedData.rewardId)
      .single()

    if (rewardError) {
      if (rewardError.code === 'PGRST116') {
        return errorResponse('Reward not found', 404)
      }
      throw rewardError
    }

    if (reward.quantity <= 0) {
      return errorResponse(`Sorry, "${reward.name}" is currently out of stock`, 400)
    }

    // Get variant_id if variant is selected
    let variantId = null
    if (validatedData.variantOption) {
      const { data: variant, error: variantError } = await supabase
        .from('reward_variants')
        .select('id')
        .eq('reward_id', validatedData.rewardId)
        .eq('option_name', validatedData.variantOption)
        .single()

      if (variantError) {
        if (variantError.code === 'PGRST116') {
          return errorResponse(`Variant "${validatedData.variantOption}" not found for this reward`, 404)
        }
        throw variantError
      }
      variantId = variant.id
    }

    // Insert claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({
        claim_id: claimId,
        reward_id: validatedData.rewardId,
        variant_id: variantId,
        username: validatedData.username,
        full_name: validatedData.fullName,
        phone_number: validatedData.phoneNumber,
        delivery_address: validatedData.deliveryAddress,
        ewallet_name: validatedData.ewalletName,
        ewallet_account: validatedData.ewalletAccount,
        status: 'pending'
      })
      .select()
      .single()

    if (claimError) throw claimError

    return successResponse(
      { claimId, claim },
      'Claim submitted successfully! You will receive an update once processed.'
    )
  } catch (error: any) {
    console.error('Error submitting claim:', error)
    
    if (error.name === 'ValidationError') {
      return validationErrorResponse(error.message)
    }
    
    return serverErrorResponse(error)
  }
}

// GET - Check claim status by claim_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get('claimId')

    if (!claimId) {
      return validationErrorResponse('Claim ID is required')
    }

    if (claimId.length < 5 || claimId.length > 50) {
      return validationErrorResponse('Invalid claim ID format')
    }

    // Check if database is ready
    const { data: testQuery, error: testError } = await supabase
      .from('claims')
      .select('id')
      .limit(1)
    
    // If tables don't exist yet, return mock status
    if (testError && testError.message.includes('relation')) {
      console.log('Database not ready, returning mock status')
      const statuses = ['Pending', 'Processing', 'Approved', 'Completed', 'Rejected']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      return NextResponse.json({
        claimId,
        status: randomStatus,
        rewardName: 'Demo Reward',
        message: 'Database not configured. This is demo data.'
      })
    }

    const { data: claim, error } = await supabase
      .from('claims')
      .select(`
        *,
        reward:rewards (name, points),
        variant:reward_variants (option_name)
      `)
      .eq('claim_id', claimId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Claim not found. Please check your claim ID and try again.', 404)
      }
      throw error
    }

    return successResponse({
      claimId: claim.claim_id,
      rewardName: claim.reward?.name || 'Unknown Reward',
      points: claim.reward?.points || 0,
      variant: claim.variant?.option_name || 'N/A',
      status: claim.status,
      username: claim.username,
      fullName: claim.full_name,
      phoneNumber: claim.phone_number,
      deliveryAddress: claim.delivery_address,
      createdAt: claim.created_at,
      updatedAt: claim.updated_at
    })
  } catch (error: any) {
    console.error('Error checking claim:', error)
    return serverErrorResponse(error)
  }
}
