/*
Domain: Environment Validation
Responsibility: Validar y gestionar variables de entorno críticas
Dependencies: process.env
*/

interface EnvValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  config: Record<string, any>
}

interface EnvRequirement {
  key: string
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'url'
  defaultValue?: any
  validator?: (value: any) => boolean
  description: string
}

const ENV_REQUIREMENTS: EnvRequirement[] = [
  // Core application
  {
    key: 'NODE_ENV',
    required: true,
    type: 'string',
    defaultValue: 'development',
    description: 'Application environment'
  },
  {
    key: 'NEXT_PUBLIC_BASE_URL',
    required: false,
    type: 'url',
    defaultValue: 'http://localhost:3000',
    description: 'Application base URL'
  },

  // UF and Currency
  {
    key: 'NEXT_PUBLIC_UF_VALUE_CLP',
    required: false,
    type: 'number',
    defaultValue: 38000,
    validator: (value: number) => value >= 30000 && value <= 50000,
    description: 'Current UF value in Chilean pesos'
  },
  {
    key: 'UF_UPDATE_API_URL',
    required: false,
    type: 'url',
    description: 'API endpoint for UF value updates'
  },

  // Default expenses
  {
    key: 'NEXT_PUBLIC_DEFAULT_MAINTENANCE',
    required: false,
    type: 'number',
    defaultValue: 500000,
    validator: (value: number) => value >= 0,
    description: 'Default annual maintenance cost in CLP'
  },
  {
    key: 'NEXT_PUBLIC_DEFAULT_PROPERTY_TAX',
    required: false,
    type: 'number',
    defaultValue: 300000,
    validator: (value: number) => value >= 0,
    description: 'Default annual property tax in CLP'
  },
  {
    key: 'NEXT_PUBLIC_DEFAULT_INSURANCE',
    required: false,
    type: 'number',
    defaultValue: 200000,
    validator: (value: number) => value >= 0,
    description: 'Default annual insurance cost in CLP'
  },

  // Commission rates
  {
    key: 'NEXT_PUBLIC_PLAN_A_COMMISSION',
    required: false,
    type: 'number',
    defaultValue: 12,
    validator: (value: number) => value >= 5 && value <= 20,
    description: 'Plan A commission percentage (5-20%)'
  },
  {
    key: 'NEXT_PUBLIC_PLAN_B_COMMISSION',
    required: false,
    type: 'number',
    defaultValue: 10,
    validator: (value: number) => value >= 5 && value <= 20,
    description: 'Plan B commission percentage (5-20%)'
  },
  {
    key: 'NEXT_PUBLIC_PLAN_C_COMMISSION',
    required: false,
    type: 'number',
    defaultValue: 8,
    validator: (value: number) => value >= 5 && value <= 20,
    description: 'Plan C commission percentage (5-20%)'
  },

  // Propital Integration
  {
    key: 'NEXT_PUBLIC_PROPITAL_API_URL',
    required: false,
    type: 'url',
    defaultValue: 'https://api.propital.com/v1',
    description: 'Propital API base URL'
  },
  {
    key: 'PROPITAL_API_KEY',
    required: false,
    type: 'string',
    description: 'Propital API authentication key'
  },
  {
    key: 'NEXT_PUBLIC_ENABLE_PROPITAL_INTEGRATION',
    required: false,
    type: 'boolean',
    defaultValue: false,
    description: 'Enable/disable Propital integration'
  },

  // Email and notifications
  {
    key: 'EMAIL_ENABLED',
    required: false,
    type: 'boolean',
    defaultValue: false,
    description: 'Enable email notifications'
  },
  {
    key: 'SLACK_WEBHOOK_URL',
    required: false,
    type: 'url',
    description: 'Slack webhook URL for internal notifications'
  },

  // Company information
  {
    key: 'NEXT_PUBLIC_COMPANY_NAME',
    required: false,
    type: 'string',
    defaultValue: 'TuMatch',
    description: 'Company name for branding'
  },
  {
    key: 'NEXT_PUBLIC_CONTACT_EMAIL',
    required: false,
    type: 'string',
    defaultValue: 'contacto@tumatch.cl',
    description: 'Company contact email'
  },
  {
    key: 'NEXT_PUBLIC_SUPPORT_PHONE',
    required: false,
    type: 'string',
    defaultValue: '+56 9 1234 5678',
    description: 'Company support phone number'
  }
]

function parseEnvValue(value: string | undefined, type: EnvRequirement['type']): any {
  if (!value) return undefined

  switch (type) {
    case 'number':
      const num = parseFloat(value)
      return isNaN(num) ? undefined : num
    case 'boolean':
      return value.toLowerCase() === 'true'
    case 'url':
      try {
        new URL(value)
        return value
      } catch {
        return undefined
      }
    case 'string':
    default:
      return value.trim() || undefined
  }
}

function validateEnvValue(requirement: EnvRequirement, value: any): { isValid: boolean; error?: string } {
  // Check if required value is missing
  if (requirement.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      error: `Required environment variable ${requirement.key} is missing`
    }
  }

  // If value is missing but not required, use default
  if (value === undefined && requirement.defaultValue !== undefined) {
    return { isValid: true }
  }

  // Skip validation if value is undefined and not required
  if (value === undefined) {
    return { isValid: true }
  }

  // Type-specific validation
  switch (requirement.type) {
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return {
          isValid: false,
          error: `${requirement.key} must be a valid number`
        }
      }
      break
    case 'url':
      try {
        new URL(value)
      } catch {
        return {
          isValid: false,
          error: `${requirement.key} must be a valid URL`
        }
      }
      break
    case 'boolean':
      if (typeof value !== 'boolean') {
        return {
          isValid: false,
          error: `${requirement.key} must be 'true' or 'false'`
        }
      }
      break
  }

  // Custom validator
  if (requirement.validator && !requirement.validator(value)) {
    return {
      isValid: false,
      error: `${requirement.key} failed custom validation: ${requirement.description}`
    }
  }

  return { isValid: true }
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const config: Record<string, any> = {}

  for (const requirement of ENV_REQUIREMENTS) {
    const rawValue = process.env[requirement.key]
    const parsedValue = parseEnvValue(rawValue, requirement.type)
    const finalValue = parsedValue !== undefined ? parsedValue : requirement.defaultValue

    const validation = validateEnvValue(requirement, parsedValue)

    if (!validation.isValid) {
      errors.push(validation.error!)
    } else {
      // Set final value in config
      config[requirement.key] = finalValue

      // Add warning if using default value for important variables
      if (parsedValue === undefined && requirement.defaultValue !== undefined) {
        warnings.push(`Using default value for ${requirement.key}: ${requirement.defaultValue}`)
      }
    }
  }

  // Additional validations
  if (config.NEXT_PUBLIC_ENABLE_PROPITAL_INTEGRATION && !config.PROPITAL_API_KEY) {
    warnings.push('Propital integration is enabled but API key is missing - integration will use mock data')
  }

  if (config.EMAIL_ENABLED && !process.env.EMAIL_API_KEY) {
    warnings.push('Email is enabled but EMAIL_API_KEY is missing - email functionality will be disabled')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  }
}

export function getValidatedConfig(): Record<string, any> {
  const result = validateEnvironment()
  
  if (!result.isValid) {
    console.error('Environment validation failed:', result.errors)
    throw new Error(`Environment validation failed: ${result.errors.join(', ')}`)
  }

  if (result.warnings.length > 0) {
    console.warn('Environment warnings:', result.warnings)
  }

  return result.config
}

export function printEnvironmentStatus(): void {
  const result = validateEnvironment()
  
  console.log('\n🔍 Environment Validation Results:')
  console.log('=====================================')
  
  if (result.isValid) {
    console.log('✅ All required environment variables are valid')
  } else {
    console.log('❌ Environment validation failed')
    result.errors.forEach(error => console.log(`   - ${error}`))
  }
  
  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    result.warnings.forEach(warning => console.log(`   - ${warning}`))
  }
  
  console.log(`\n📊 Configuration loaded with ${Object.keys(result.config).length} variables`)
  console.log('=====================================\n')
}

// Initialize validation on import in development
if (process.env.NODE_ENV === 'development') {
  try {
    printEnvironmentStatus()
  } catch (error) {
    console.error('Failed to validate environment:', error)
  }
}