import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rewards as staticRewards } from '@/app/rewardsData'
import { successResponse, serverErrorResponse } from '@/lib/apiResponse'

// GET all rewards with their variants and galleries
export async function GET() {
  try {
    // Fetch all rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .order('points', { ascending: false })

    // If tables don't exist yet, return static data
    if (rewardsError) {
      console.log('Database not ready, using static data:', rewardsError.message)
      return NextResponse.json(staticRewards)
    }

    // Fetch all variants and galleries for each reward
    const rewardsWithDetails = await Promise.all(
      rewards.map(async (reward) => {
        // Get variants for this reward
        const { data: variants, error: variantsError } = await supabase
          .from('reward_variants')
          .select('*')
          .eq('reward_id', reward.id)

        if (variantsError) throw variantsError

        // Get galleries for each variant
        const variantOptions: string[] = []
        const galleries: Record<string, string[]> = {}

        for (const variant of variants) {
          variantOptions.push(variant.option_name)

          const { data: galleryImages, error: galleryError } = await supabase
            .from('reward_galleries')
            .select('*')
            .eq('variant_id', variant.id)
            .order('image_order', { ascending: true })

          if (galleryError) throw galleryError

          galleries[variant.option_name] = galleryImages.map(img => img.image_url)
        }

        // Count approved claims to calculate available stock
        const { count: approvedCount, error: claimsError } = await supabase
          .from('claims')
          .select('*', { count: 'exact', head: true })
          .eq('reward_id', reward.id)
          .eq('status', 'Approved')

        if (claimsError) throw claimsError

        const availableQuantity = Math.max(0, reward.quantity - (approvedCount || 0))

        return {
          id: reward.id,
          name: reward.name,
          points: reward.points,
          category: reward.category,
          quantity: availableQuantity,
          tier: reward.tier || 'bronze',
          variants: variantOptions.length > 0 ? {
            type: reward.variant_type,
            options: variantOptions
          } : undefined,
          image: galleries[variantOptions[0]]?.[0] || '',
          galleries: Object.keys(galleries).length > 0 ? galleries : undefined
        }
      })
    )

    return successResponse(rewardsWithDetails)
  } catch (error: any) {
    console.error('Error fetching rewards:', error)
    return serverErrorResponse(error)
  }
}

// POST - Create a new reward with variants and galleries
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, points, category, quantity, variants, galleries } = body
    
    // Note: This endpoint is kept for backwards compatibility
    // New code should use /api/admin/rewards with full validation

    // Insert reward
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .insert({
        name,
        points,
        category,
        quantity,
        variant_type: variants?.type
      })
      .select()
      .single()

    if (rewardError) throw rewardError

    // Insert variants and galleries
    if (variants && galleries) {
      for (const option of variants.options) {
        // Insert variant
        const { data: variant, error: variantError } = await supabase
          .from('reward_variants')
          .insert({
            reward_id: reward.id,
            option_name: option
          })
          .select()
          .single()

        if (variantError) throw variantError

        // Insert galleries for this variant
        const galleryImages = galleries[option] || []
        for (let i = 0; i < galleryImages.length; i++) {
          const { error: galleryError } = await supabase
            .from('reward_galleries')
            .insert({
              variant_id: variant.id,
              image_url: galleryImages[i],
              image_order: i
            })

          if (galleryError) throw galleryError
        }
      }
    }

    return successResponse({ reward }, 'Reward created successfully', 201)
  } catch (error: any) {
    console.error('Error creating reward:', error)
    return serverErrorResponse(error)
  }
}
