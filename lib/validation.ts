// Validation utilities for API endpoints

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Phone number validation (Philippine format)
export function validatePhoneNumber(phone: string): boolean {
  // Accepts formats: 09171234567, +639171234567, 9171234567
  const phoneRegex = /^(\+63|0)?9\d{9}$/
  return phoneRegex.test(phone.replace(/\s|-/g, ''))
}

// Username validation
export function validateUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Required field validation
export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`)
  }
}

// String length validation
export function validateStringLength(
  value: string,
  fieldName: string,
  min: number = 0,
  max: number = Infinity
): void {
  if (value.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`)
  }
  if (value.length > max) {
    throw new ValidationError(`${fieldName} must be at most ${max} characters`)
  }
}

// Number range validation
export function validateNumberRange(
  value: number,
  fieldName: string,
  min: number = -Infinity,
  max: number = Infinity
): void {
  if (isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`)
  }
  if (value < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`)
  }
  if (value > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`)
  }
}

// Integer validation
export function validateInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value)) {
    throw new ValidationError(`${fieldName} must be an integer`)
  }
}

// Enum validation
export function validateEnum(
  value: string,
  fieldName: string,
  allowedValues: string[]
): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    )
  }
}

// Reward validation
export interface RewardInput {
  name: string
  points: number
  category: string
  quantity: number
  variantType?: string
  variantOptions?: string
  galleries?: Record<string, string[]>
}

export function validateRewardInput(data: any): RewardInput {
  // Required fields
  validateRequired(data.name, 'Reward name')
  validateRequired(data.points, 'Points')
  validateRequired(data.category, 'Category')
  validateRequired(data.quantity, 'Quantity')

  // String validations
  validateStringLength(data.name, 'Reward name', 3, 255)
  validateStringLength(data.category, 'Category', 3, 100)

  // Number validations
  const points = Number(data.points)
  const quantity = Number(data.quantity)
  
  validateNumberRange(points, 'Points', 1, 1000000)
  validateInteger(points, 'Points')
  
  validateNumberRange(quantity, 'Quantity', 0, 10000)
  validateInteger(quantity, 'Quantity')

  // Category validation
  const validCategories = ['Gadget', 'E-Wallet', 'Vehicle', 'Luxury', 'Electronics', 'Other']
  validateEnum(data.category, 'Category', validCategories)

  // Variant validation
  if (data.variantType) {
    validateStringLength(data.variantType, 'Variant type', 2, 100)
  }

  // Validate gallery URLs if provided
  if (data.galleries) {
    for (const [variant, urls] of Object.entries(data.galleries)) {
      if (Array.isArray(urls)) {
        for (const url of urls) {
          if (url && !validateUrl(url)) {
            throw new ValidationError(`Invalid gallery URL for variant "${variant}": ${url}`)
          }
        }
      }
    }
  }

  return {
    name: data.name.trim(),
    points,
    category: data.category,
    quantity,
    variantType: data.variantType?.trim(),
    variantOptions: data.variantOptions?.trim(),
    galleries: data.galleries
  }
}

// Claim validation
export interface ClaimInput {
  rewardId: string
  variantOption?: string
  username: string
  fullName: string
  phoneNumber: string
  deliveryAddress?: string
  ewalletName?: string
  ewalletAccount?: string
}

export function validateClaimInput(data: any): ClaimInput {
  // Required fields
  validateRequired(data.rewardId, 'Reward ID')
  validateRequired(data.username, 'Username')
  validateRequired(data.fullName, 'Full name')
  validateRequired(data.phoneNumber, 'Phone number')

  // Username validation
  if (!validateUsername(data.username)) {
    throw new ValidationError(
      'Username must be 3-20 characters long and contain only letters, numbers, and underscores'
    )
  }

  // Full name validation
  validateStringLength(data.fullName, 'Full name', 3, 255)
  
  // Phone number validation
  if (!validatePhoneNumber(data.phoneNumber)) {
    throw new ValidationError(
      'Invalid phone number format. Please use Philippine mobile format (e.g., 09171234567)'
    )
  }

  // At least one delivery method required
  if (!data.deliveryAddress && !data.ewalletAccount) {
    throw new ValidationError(
      'Please provide either a delivery address or e-wallet account'
    )
  }

  // Delivery address validation
  if (data.deliveryAddress) {
    validateStringLength(data.deliveryAddress, 'Delivery address', 10, 500)
  }

  // E-wallet validation
  if (data.ewalletAccount) {
    validateRequired(data.ewalletName, 'E-wallet name')
    validateStringLength(data.ewalletAccount, 'E-wallet account', 5, 100)
  }

  return {
    rewardId: data.rewardId,
    variantOption: data.variantOption?.trim(),
    username: data.username.trim(),
    fullName: data.fullName.trim(),
    phoneNumber: data.phoneNumber.replace(/\s|-/g, ''),
    deliveryAddress: data.deliveryAddress?.trim(),
    ewalletName: data.ewalletName?.trim(),
    ewalletAccount: data.ewalletAccount?.trim()
  }
}

// Claim status validation
export function validateClaimStatus(status: string): void {
  const validStatuses = ['pending', 'approved', 'processing', 'shipped', 'delivered', 'rejected']
  validateEnum(status, 'Status', validStatuses)
}

// File upload validation
export function validateFileUpload(file: File): void {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!file) {
    throw new ValidationError('No file provided')
  }

  if (!validTypes.includes(file.type)) {
    throw new ValidationError(
      'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
    )
  }

  if (file.size > maxSize) {
    throw new ValidationError('File size too large. Maximum size is 5MB.')
  }
}

// UUID validation
export function validateUUID(id: string, fieldName: string = 'ID'): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`)
  }
}
