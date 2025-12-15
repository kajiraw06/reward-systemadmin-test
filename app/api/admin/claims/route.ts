import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateClaimStatus, ValidationError } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse'

// GET - Fetch all claims for admin dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Validate status filter if provided
    if (status) {
      try {
        validateClaimStatus(status.toLowerCase())
      } catch (error: any) {
        return validationErrorResponse(error.message)
      }
    }

    let query = supabase
      .from('claims')
      .select(`
        *,
        reward:rewards(name, points),
        variant:reward_variants(option_name)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status.toLowerCase())
    }

    const { data: claims, error } = await query

    if (error) throw error

    // Transform data to match admin panel structure
    const transformedClaims = claims.map((claim: any) => ({
      id: claim.claim_id,
      rewardName: claim.reward?.name || 'Unknown',
      points: claim.reward?.points || 0,
      username: claim.username,
      name: claim.full_name,
      phone: claim.phone_number,
      address: claim.delivery_address || 'N/A',
      walletName: claim.ewallet_name || 'N/A',
      walletNumber: claim.ewallet_account || 'N/A',
      status: claim.status,
      reason: claim.rejection_reason || '',
      variant: claim.variant?.option_name || 'N/A',
      timestamp: new Date(claim.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }))

    return successResponse(transformedClaims)
  } catch (error: any) {
    console.error('Error fetching claims:', error)
    return serverErrorResponse(error)
  }
}

// Helper function to log actions
async function logAction(action: string, claimId: string, status: string, details?: string) {
  try {
    // Get claim details for logging
    const { data: claim } = await supabase
      .from('claims')
      .select(`
        username,
        full_name,
        reward:rewards(name)
      `)
      .eq('claim_id', claimId)
      .single()

    // Insert audit log
    await supabase
      .from('audit_logs')
      .insert({
        action: action,
        admin_user: 'Admin', // You can pass this from session/auth
        claim_id: claimId,
        reward_name: claim?.reward?.name || 'Unknown',
        user_name: claim?.full_name || claim?.username || 'Unknown',
        details: details || `Claim ${status}`,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging action:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

// PATCH - Update claim status
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { claimId, status, rejectionReason } = body

    // Validate required fields
    if (!claimId || !status) {
      return validationErrorResponse('Claim ID and status are required')
    }

    // Validate claim ID format
    if (typeof claimId !== 'string' || claimId.length < 5 || claimId.length > 50) {
      return validationErrorResponse('Invalid claim ID format')
    }

    // Validate status
    try {
      validateClaimStatus(status.toLowerCase())
    } catch (error: any) {
      return validationErrorResponse(error.message)
    }

    // Validate rejection reason if status is rejected
    if (status.toLowerCase() === 'rejected') {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        return validationErrorResponse('Rejection reason is required when rejecting a claim')
      }
      if (rejectionReason.length > 500) {
        return validationErrorResponse('Rejection reason must be at most 500 characters')
      }
    }

    const updateData: any = {
      status: status.toLowerCase(),
      updated_at: new Date().toISOString()
    }

    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason.trim()
    }

    // If approving, decrease the reward quantity
    if (status.toLowerCase() === 'approved') {
      // First, get the claim to find the reward_id and check current status
      const { data: claim, error: claimError } = await supabase
        .from('claims')
        .select('reward_id, status')
        .eq('claim_id', claimId)
        .single()

      if (claimError) {
        if (claimError.code === 'PGRST116') {
          return errorResponse('Claim not found', 404)
        }
        throw claimError
      }

      // Prevent double-approval
      if (claim.status === 'approved') {
        return errorResponse('This claim has already been approved', 400)
      }

      // Get the current reward quantity
      const { data: reward, error: rewardError } = await supabase
        .from('rewards')
        .select('quantity, name')
        .eq('id', claim.reward_id)
        .single()

      if (rewardError) throw rewardError

      // Check if item is out of stock
      if (reward.quantity <= 0) {
        return errorResponse(
          `This item is already out of stock. Cannot approve claim for "${reward.name}".`,
          400
        )
      }

      // Decrease quantity by 1
      const newQuantity = reward.quantity - 1

      // Update the reward quantity
      const { error: updateRewardError } = await supabase
        .from('rewards')
        .update({ quantity: newQuantity })
        .eq('id', claim.reward_id)

      if (updateRewardError) throw updateRewardError
    }

    const { data, error } = await supabase
      .from('claims')
      .update(updateData)
      .eq('claim_id', claimId)
      .select()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Claim not found', 404)
      }
      throw error
    }

    if (!data || data.length === 0) {
      return errorResponse('Claim not found', 404)
    }

    // Log the action
    const actionDetails = rejectionReason 
      ? `Claim ${status} - Reason: ${rejectionReason}`
      : `Claim ${status}`
    await logAction(status, claimId, status, actionDetails)

    return successResponse(data, `Claim status updated to ${status} successfully`)
  } catch (error: any) {
    console.error('Error updating claim:', error)
    return serverErrorResponse(error)
  }
}
