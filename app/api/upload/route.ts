import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateFileUpload } from '@/lib/validation'
import { successResponse, errorResponse, validationErrorResponse, serverErrorResponse } from '@/lib/apiResponse'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    // Validate file
    try {
      validateFileUpload(file)
    } catch (error: any) {
      return validationErrorResponse(error.message)
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `rewards/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('reward-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return errorResponse(
        error.message || 'Upload failed. Make sure the storage bucket is configured.',
        500
      )
    }

    if (!data) {
      return errorResponse('Upload failed. No data returned from storage.', 500)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('reward-images')
      .getPublicUrl(filePath)

    if (!publicUrl) {
      return errorResponse('Failed to generate public URL for uploaded file', 500)
    }

    return successResponse({ url: publicUrl }, 'File uploaded successfully')
  } catch (error) {
    console.error('Server error:', error)
    return serverErrorResponse(error)
  }
}
