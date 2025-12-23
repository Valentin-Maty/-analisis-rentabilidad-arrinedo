'use client'

interface FieldStatusProps {
  isValid: boolean
  value: string | undefined
  errorMessage?: string
  successMessage?: string
}

export default function FieldStatus({ isValid, value, errorMessage, successMessage }: FieldStatusProps) {
  if (!value) return null
  
  if (isValid) {
    return (
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-green-500 text-sm">✓</span>
        <span className="text-green-600 text-xs">{successMessage || 'Perfecto'}</span>
      </div>
    )
  } else {
    return (
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-red-500 text-sm">⚠️</span>
        <span className="text-red-600 text-xs">{errorMessage || 'Revise este campo'}</span>
      </div>
    )
  }
}