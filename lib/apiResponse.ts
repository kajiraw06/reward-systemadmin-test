// Standardized API response utilities
import { NextResponse } from 'next/server'

// Success response
export function successResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status }
  )
}

// Error response
export function errorResponse(error: string | Error, status: number = 500) {
  const message = typeof error === 'string' ? error : error.message
  
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status }
  )
}

// Validation error response (400)
export function validationErrorResponse(error: string | Error) {
  return errorResponse(error, 400)
}

// Not found response (404)
export function notFoundResponse(resource: string = 'Resource') {
  return errorResponse(`${resource} not found`, 404)
}

// Unauthorized response (401)
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401)
}

// Forbidden response (403)
export function forbiddenResponse(message: string = 'Forbidden') {
  return errorResponse(message, 403)
}

// Conflict response (409)
export function conflictResponse(message: string) {
  return errorResponse(message, 409)
}

// Server error response (500)
export function serverErrorResponse(error: any) {
  console.error('Server error:', error)
  return errorResponse(
    'An unexpected error occurred. Please try again later.',
    500
  )
}

// Handle async API route with error catching
export function handleApiRoute(
  handler: (request: any) => Promise<NextResponse>
) {
  return async (request: any) => {
    try {
      return await handler(request)
    } catch (error: any) {
      console.error('API Error:', error)
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        return validationErrorResponse(error.message)
      }
      
      // Handle Supabase errors
      if (error.code === 'PGRST116') {
        return notFoundResponse()
      }
      
      // Handle other errors
      return serverErrorResponse(error)
    }
  }
}
