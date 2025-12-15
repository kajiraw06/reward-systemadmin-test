import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateRewardInput, validateUUID, ValidationError } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Fetch all rewards with variants and galleries
export async function GET(request: NextRequest) {
  try {
    const { data: rewards, error } = await supabase
      .from('rewards')
      .select(`
        *,
        variants:reward_variants(
          id,
          option_name,
          galleries:reward_galleries(
            id,
            image_url,
            image_order
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform data to match frontend format
    const transformedRewards = rewards.map((reward: any) => ({
      id: reward.id,
      name: reward.name,
      points: reward.points,
      category: reward.category,
      quantity: reward.quantity,
      tier: reward.tier || 'bronze',
      is_active: reward.is_active !== undefined ? reward.is_active : true,
      low_stock_threshold: reward.low_stock_threshold || 5,
      last_restocked_at: reward.last_restocked_at,
      variants: {
        type: reward.variant_type || 'color',
        options: reward.variants?.map((v: any) => v.option_name) || []
      },
      galleries: reward.variants?.reduce((acc: any, variant: any) => {
        acc[variant.option_name] = variant.galleries
          ?.sort((a: any, b: any) => a.image_order - b.image_order)
          ?.map((g: any) => g.image_url) || []
        return acc
      }, {})
    }))

    return successResponse(transformedRewards)
  } catch (error: any) {
    console.error('Error fetching rewards:', error)
    return serverErrorResponse(error)
  }
}

// PATCH - Update a reward
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, points, category, quantity, variantType, variantOptions, tier, galleries } = body

    // Validate reward ID
    if (!id) {
      return validationErrorResponse('Reward ID is required')
    }
    
    try {
      validateUUID(id, 'Reward ID')
    } catch (error: any) {
      return validationErrorResponse(error.message)
    }

    // Validate reward data
    const validatedData = validateRewardInput({
      name,
      points,
      category,
      quantity,
      variantType,
      variantOptions,
      galleries
    })

    // Check if reward exists
    const { data: existingReward, error: checkError } = await supabase
      .from('rewards')
      .select('id, name')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return errorResponse('Reward not found', 404)
      }
      throw checkError
    }

    // Update reward basic info
    const { error: updateError } = await supabase
      .from('rewards')
      .update({
        name: validatedData.name,
        points: validatedData.points,
        category: validatedData.category,
        quantity: validatedData.quantity,
        variant_type: validatedData.variantType,
        tier: tier || 'bronze',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    // Get current variants
    const { data: currentVariants } = await supabase
      .from('reward_variants')
      .select('id, option_name')
      .eq('reward_id', id)

    const currentOptions = currentVariants?.map(v => v.option_name) || []
    const newOptions = validatedData.variantOptions 
      ? validatedData.variantOptions.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      : []

    // Delete removed variants
    const toDelete = currentVariants?.filter(v => !newOptions.includes(v.option_name)) || []
    if (toDelete.length > 0) {
      await supabase
        .from('reward_variants')
        .delete()
        .in('id', toDelete.map(v => v.id))
    }

    // Add new variants
    const toAdd = newOptions.filter((opt: string) => !currentOptions.includes(opt))
    if (toAdd.length > 0) {
      await supabase
        .from('reward_variants')
        .insert(
          toAdd.map((option: string) => ({
            reward_id: id,
            option_name: option
          }))
        )
    }

    // Update galleries if provided
    if (validatedData.galleries) {
      // Get updated variant list
      const { data: updatedVariants } = await supabase
        .from('reward_variants')
        .select('id, option_name')
        .eq('reward_id', id)

      if (updatedVariants && updatedVariants.length > 0) {
        // Delete all existing galleries for all variants in one operation
        const variantIds = updatedVariants.map(v => v.id)
        await supabase
          .from('reward_galleries')
          .delete()
          .in('variant_id', variantIds)

        // Prepare all galleries to insert in one batch
        const galleriesToInsert: any[] = []
        for (const variant of updatedVariants) {
          const variantGalleries = validatedData.galleries![variant.option_name] || []
          if (variantGalleries.length > 0) {
            variantGalleries.forEach((url: string, index: number) => {
              if (url && url.trim()) {
                galleriesToInsert.push({
                  variant_id: variant.id,
                  image_url: url,
                  image_order: index
                })
              }
            })
          }
        }

        // Insert all galleries in one operation
        if (galleriesToInsert.length > 0) {
          await supabase
            .from('reward_galleries')
            .insert(galleriesToInsert)
        }
      }
    }

    return successResponse(null, 'Reward updated successfully')
  } catch (error: any) {
    console.error('Error updating reward:', error)
    
    if (error.name === 'ValidationError') {
      return validationErrorResponse(error.message)
    }
    
    return serverErrorResponse(error)
  }
}

// DELETE - Delete a reward
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return validationErrorResponse('Reward ID is required')
    }

    // Validate UUID format
    try {
      validateUUID(id, 'Reward ID')
    } catch (error: any) {
      return validationErrorResponse(error.message)
    }

    // Check if there are any claims for this reward
    const { data: claims, error: claimsError } = await supabase
      .from('claims')
      .select('id')
      .eq('reward_id', id)

    if (claimsError) throw claimsError

    if (claims && claims.length > 0) {
      return errorResponse(
        `Cannot delete reward. There are ${claims.length} claim(s) associated with this reward. Please delete or reassign the claims first.`,
        400
      )
    }

    // Verify reward exists before deleting
    const { data: reward, error: checkError } = await supabase
      .from('rewards')
      .select('id, name')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return errorResponse('Reward not found', 404)
      }
      throw checkError
    }

    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id)

    if (error) throw error

    return successResponse(null, `Reward "${reward.name}" deleted successfully`)
  } catch (error: any) {
    console.error('Error deleting reward:', error)
    return serverErrorResponse(error)
  }
}

// POST - Create a new reward
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier } = body
    
    // Validate reward data
    const validatedData = validateRewardInput(body)

    // Check for duplicate reward names
    const { data: existingReward, error: duplicateError } = await supabase
      .from('rewards')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingReward) {
      return errorResponse(`A reward with the name "${validatedData.name}" already exists`, 409)
    }

    // Insert reward
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .insert({
        name: validatedData.name,
        points: validatedData.points,
        category: validatedData.category,
        quantity: validatedData.quantity,
        variant_type: validatedData.variantType,
        tier: tier || 'bronze'
      })
      .select()
      .single()

    if (rewardError) throw rewardError

    // Insert variants
    const options = validatedData.variantOptions 
      ? validatedData.variantOptions.split(',').map((s: string) => s.trim()).filter((s: string) => s)
      : []
    if (options.length > 0) {
      const { data: variants, error: variantsError } = await supabase
        .from('reward_variants')
        .insert(
          options.map((option: string) => ({
            reward_id: reward.id,
            option_name: option
          }))
        )
        .select()

      if (variantsError) throw variantsError

      // Insert galleries if provided - batch all inserts
      if (validatedData.galleries && variants) {
        const galleriesToInsert: any[] = []
        for (const variant of variants) {
          const variantGalleries = validatedData.galleries[variant.option_name] || []
          if (variantGalleries.length > 0) {
            variantGalleries.forEach((url: string, index: number) => {
              if (url && url.trim()) {
                galleriesToInsert.push({
                  variant_id: variant.id,
                  image_url: url,
                  image_order: index
                })
              }
            })
          }
        }
        
        // Insert all galleries in one batch operation
        if (galleriesToInsert.length > 0) {
          await supabase
            .from('reward_galleries')
            .insert(galleriesToInsert)
        }
      }
    }

    return successResponse({ reward }, 'Reward created successfully', 201)
  } catch (error: any) {
    console.error('Error creating reward:', error)
    
    if (error.name === 'ValidationError') {
      return validationErrorResponse(error.message)
    }
    
    return serverErrorResponse(error)
  }
}
