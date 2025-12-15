import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, serverErrorResponse } from '@/lib/apiResponse'

// GET - Fetch analytics data for admin dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'popular-rewards'
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = parseInt(searchParams.get('days') || '30')

    if (type === 'popular-rewards') {
      // Get most claimed rewards with counts
      const { data: claims, error } = await supabase
        .from('claims')
        .select(`
          reward_id,
          reward:rewards(name, points, category)
        `)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .in('status', ['approved', 'processing', 'shipped', 'delivered'])

      if (error) throw error

      // Count occurrences of each reward
      const rewardCounts: Record<string, any> = {}
      claims?.forEach((claim: any) => {
        const rewardId = claim.reward_id
        const rewardName = claim.reward?.name || 'Unknown'
        const rewardPoints = claim.reward?.points || 0
        const rewardCategory = claim.reward?.category || 'Other'

        if (!rewardCounts[rewardId]) {
          rewardCounts[rewardId] = {
            id: rewardId,
            name: rewardName,
            points: rewardPoints,
            category: rewardCategory,
            count: 0,
            totalPoints: 0
          }
        }
        rewardCounts[rewardId].count++
        rewardCounts[rewardId].totalPoints += rewardPoints
      })

      // Convert to array and sort by count
      const sortedRewards = Object.values(rewardCounts)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, limit)

      return successResponse(sortedRewards)
    }

    if (type === 'claims-stats') {
      // Get overall claims statistics
      const { data: allClaims, error } = await supabase
        .from('claims')
        .select('status, created_at, reward:rewards(points)')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      const stats = {
        total: allClaims?.length || 0,
        pending: allClaims?.filter((c: any) => c.status === 'pending').length || 0,
        approved: allClaims?.filter((c: any) => c.status === 'approved').length || 0,
        processing: allClaims?.filter((c: any) => c.status === 'processing').length || 0,
        shipped: allClaims?.filter((c: any) => c.status === 'shipped').length || 0,
        delivered: allClaims?.filter((c: any) => c.status === 'delivered').length || 0,
        rejected: allClaims?.filter((c: any) => c.status === 'rejected').length || 0,
        totalPoints: allClaims?.reduce((sum: number, c: any) => sum + (c.reward?.points || 0), 0) || 0,
        approvalRate: allClaims?.length 
          ? ((allClaims.filter((c: any) => ['approved', 'processing', 'shipped', 'delivered'].includes(c.status)).length / allClaims.length) * 100).toFixed(1)
          : 0
      }

      return successResponse(stats)
    }

    if (type === 'daily-claims') {
      // Get claims grouped by day
      const { data: claims, error } = await supabase
        .from('claims')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date
      const dailyData: Record<string, any> = {}
      claims?.forEach((claim: any) => {
        const date = new Date(claim.created_at).toISOString().split('T')[0]
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0
          }
        }
        dailyData[date].total++
        if (['approved', 'processing', 'shipped', 'delivered'].includes(claim.status)) {
          dailyData[date].approved++
        } else if (claim.status === 'rejected') {
          dailyData[date].rejected++
        } else if (claim.status === 'pending') {
          dailyData[date].pending++
        }
      })

      const sortedDailyData = Object.values(dailyData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      return successResponse(sortedDailyData)
    }

    if (type === 'category-distribution') {
      // Get claims by category
      const { data: claims, error } = await supabase
        .from('claims')
        .select(`
          reward:rewards(category)
        `)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .in('status', ['approved', 'processing', 'shipped', 'delivered'])

      if (error) throw error

      const categoryCounts: Record<string, number> = {}
      claims?.forEach((claim: any) => {
        const category = claim.reward?.category || 'Other'
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })

      const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
        name,
        value
      }))

      return successResponse(categoryData)
    }

    return successResponse([])
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    return serverErrorResponse(error)
  }
}
