'use client'

import { UseFormRegisterReturn } from 'react-hook-form'
import FieldStatus from './FieldStatus'

interface SmartInputProps {
  label: string
  registration: UseFormRegisterReturn
  placeholder?: string
  type?: string
  icon?: string
  helpText?: string
  value?: string
  isValid?: boolean
  errorMessage?: string
  successMessage?: string
  required?: boolean
}

export default function SmartInput({
  label,
  registration,
  placeholder,
  type = 'text',
  icon,
  helpText,
  value,
  isValid = false,
  errorMessage,
  successMessage,
  required = false
}: SmartInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="label flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
        </label>
      )}
      
      {helpText && (
        <p className="text-sm text-gray-600">{helpText}</p>
      )}
      
      <div className="relative">
        <input
          {...registration}
          type={type}
          className={`input pr-10 transition-colors ${
            errorMessage ? 'border-red-500 bg-red-50' : 
            isValid && value ? 'border-green-500 bg-green-50' : 
            value ? 'border-blue-400' : ''
          }`}
          placeholder={placeholder}
        />
        {value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <span className="text-green-500 font-bold">✓</span>
            ) : errorMessage ? (
              <span className="text-red-500 font-bold">⚠️</span>
            ) : (
              <span className="text-blue-500 font-bold">✏️</span>
            )}
          </div>
        )}
      </div>
      
      <FieldStatus 
        isValid={isValid} 
        value={value}
        errorMessage={errorMessage}
        successMessage={successMessage}
      />
    </div>
  )
}