import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, serverErrorResponse } from '@/lib/apiResponse'

// GET - Fetch audit logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')
    const adminUser = searchParams.get('admin')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply filters
    if (action) {
      query = query.eq('action', action)
    }
    if (adminUser) {
      query = query.eq('admin_user', adminUser)
    }
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    const { data: logs, error } = await query

    if (error) throw error

    // Transform data for display
    const transformedLogs = logs?.map((log: any) => ({
      id: log.id,
      action: log.action,
      adminUser: log.admin_user || 'System',
      claimId: log.claim_id || 'N/A',
      rewardName: log.reward_name || 'N/A',
      userName: log.user_name || 'N/A',
      details: log.details || '',
      timestamp: new Date(log.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    })) || []

    return successResponse(transformedLogs)
  } catch (error: any) {
    console.error('Error fetching audit logs:', error)
    return serverErrorResponse(error)
  }
}

// POST - Create audit log entry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, adminUser, claimId, rewardName, userName, details } = body

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        action,
        admin_user: adminUser,
        claim_id: claimId,
        reward_name: rewardName,
        user_name: userName,
        details,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) throw error

    return successResponse(data, 'Audit log created successfully')
  } catch (error: any) {
    console.error('Error creating audit log:', error)
    return serverErrorResponse(error)
  }
}
