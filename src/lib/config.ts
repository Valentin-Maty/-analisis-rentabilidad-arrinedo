/*
Domain: Configuration Management
Responsibility: Centralizar configuraciones y valores del sistema
Dependencies: Environment variables, validation
*/

import { getValidatedConfig } from './envValidation'

// Obtener configuración validada
const VALIDATED_CONFIG = getValidatedConfig()

// Configuración de UF y monedas (usando valores validados)
export const CURRENCY_CONFIG = {
  UF_VALUE_CLP: VALIDATED_CONFIG.NEXT_PUBLIC_UF_VALUE_CLP || 38000,
  UF_UPDATE_URL: VALIDATED_CONFIG.UF_UPDATE_API_URL || 'https://api.bancochile.cl/uf/current',
  DEFAULT_CURRENCY: (VALIDATED_CONFIG.NEXT_PUBLIC_DEFAULT_CURRENCY || 'CLP') as 'CLP' | 'UF',
} as const

// Configuración de gastos por defecto (usando valores validados)
export const DEFAULT_EXPENSES = {
  ANNUAL_MAINTENANCE_CLP: VALIDATED_CONFIG.NEXT_PUBLIC_DEFAULT_MAINTENANCE || 500000,
  ANNUAL_PROPERTY_TAX_CLP: VALIDATED_CONFIG.NEXT_PUBLIC_DEFAULT_PROPERTY_TAX || 300000,
  ANNUAL_INSURANCE_CLP: VALIDATED_CONFIG.NEXT_PUBLIC_DEFAULT_INSURANCE || 200000,
  ADMIN_PERCENTAGE: VALIDATED_CONFIG.NEXT_PUBLIC_ADMIN_PERCENTAGE || 2.5, // % del valor de la propiedad
} as const

// Configuración de comisiones por defecto (usando valores validados)
export const DEFAULT_COMMISSIONS = {
  PLAN_A: VALIDATED_CONFIG.NEXT_PUBLIC_PLAN_A_COMMISSION || 12,
  PLAN_B: VALIDATED_CONFIG.NEXT_PUBLIC_PLAN_B_COMMISSION || 10,
  PLAN_C: VALIDATED_CONFIG.NEXT_PUBLIC_PLAN_C_COMMISSION || 8,
} as const

// Configuración de análisis de rentabilidad
export const RENTAL_ANALYSIS_CONFIG = {
  // Porcentaje de pérdida diaria por vacancia
  DAILY_VACANCY_LOSS_PERCENTAGE: parseFloat(process.env.NEXT_PUBLIC_DAILY_VACANCY_LOSS || '0.033'),
  // Días máximos de análisis
  MAX_ANALYSIS_DAYS: parseInt(process.env.NEXT_PUBLIC_MAX_ANALYSIS_DAYS || '30'),
  // Porcentaje máximo de reducción viable
  MAX_REDUCTION_PERCENTAGE: parseFloat(process.env.NEXT_PUBLIC_MAX_REDUCTION || '8.33'),
  // CAP Rate mínimo considerado bueno
  GOOD_CAP_RATE: parseFloat(process.env.NEXT_PUBLIC_GOOD_CAP_RATE || '6'),
  // CAP Rate mínimo aceptable
  MIN_CAP_RATE: parseFloat(process.env.NEXT_PUBLIC_MIN_CAP_RATE || '4'),
} as const

// Configuración de planes de arriendo
export const RENTAL_PLANS_CONFIG = {
  PLAN_A: {
    MARKETING_DURATION_DAYS: parseInt(process.env.NEXT_PUBLIC_PLAN_A_MARKETING_DAYS || '30'),
    EXPECTED_RENTAL_TIME: parseInt(process.env.NEXT_PUBLIC_PLAN_A_EXPECTED_DAYS || '7'),
    MONTHS_VACANT: parseFloat(process.env.NEXT_PUBLIC_PLAN_A_MONTHS_VACANT || '0.25'),
    PRICE_ADJUSTMENTS: [
      { day: 0, reduction: 0 },
      { day: 7, reduction: 4 },
      { day: 15, reduction: 8 },
      { day: 22, reduction: 12 },
    ],
  },
  PLAN_B: {
    MARKETING_DURATION_DAYS: parseInt(process.env.NEXT_PUBLIC_PLAN_B_MARKETING_DAYS || '30'),
    EXPECTED_RENTAL_TIME: parseInt(process.env.NEXT_PUBLIC_PLAN_B_EXPECTED_DAYS || '12'),
    MONTHS_VACANT: parseFloat(process.env.NEXT_PUBLIC_PLAN_B_MONTHS_VACANT || '0.4'),
    PRICE_ADJUSTMENTS: [
      { day: 0, reduction: 0 },
      { day: 10, reduction: 5 },
      { day: 20, reduction: 10 },
    ],
  },
  PLAN_C: {
    MARKETING_DURATION_DAYS: parseInt(process.env.NEXT_PUBLIC_PLAN_C_MARKETING_DAYS || '30'),
    EXPECTED_RENTAL_TIME: parseInt(process.env.NEXT_PUBLIC_PLAN_C_EXPECTED_DAYS || '20'),
    MONTHS_VACANT: parseFloat(process.env.NEXT_PUBLIC_PLAN_C_MONTHS_VACANT || '0.67'),
    PRICE_ADJUSTMENTS: [
      { day: 0, reduction: 0 },
      { day: 15, reduction: 3 },
    ],
  },
} as const

// Configuración de Propital
export const PROPITAL_CONFIG = {
  API_BASE_URL: process.env.NEXT_PUBLIC_PROPITAL_API_URL || 'https://api.propital.com/v1',
  API_KEY: process.env.PROPITAL_API_KEY,
  INTEGRATION_ENABLED: process.env.NEXT_PUBLIC_ENABLE_PROPITAL_INTEGRATION === 'true',
  TIMEOUT_MS: parseInt(process.env.PROPITAL_TIMEOUT || '10000'),
} as const

// Configuración de notificaciones
export const NOTIFICATIONS_CONFIG = {
  EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  DEFAULT_TOAST_DURATION: parseInt(process.env.NEXT_PUBLIC_TOAST_DURATION || '5000'),
} as const

// Configuración de PDF
export const PDF_CONFIG = {
  FONT_FAMILY: process.env.NEXT_PUBLIC_PDF_FONT || 'helvetica',
  PAGE_MARGIN: parseInt(process.env.NEXT_PUBLIC_PDF_MARGIN || '20'),
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || 'TuMatch',
  COMPANY_LOGO_URL: process.env.NEXT_PUBLIC_COMPANY_LOGO,
} as const

// Configuración de validación
export const VALIDATION_CONFIG = {
  MIN_PROPERTY_VALUE: parseInt(process.env.NEXT_PUBLIC_MIN_PROPERTY_VALUE || '10000000'),
  MAX_PROPERTY_VALUE: parseInt(process.env.NEXT_PUBLIC_MAX_PROPERTY_VALUE || '1000000000'),
  MIN_PROPERTY_SIZE: parseInt(process.env.NEXT_PUBLIC_MIN_PROPERTY_SIZE || '20'),
  MAX_PROPERTY_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_PROPERTY_SIZE || '1000'),
  MIN_RENT: parseInt(process.env.NEXT_PUBLIC_MIN_RENT || '100000'),
  MAX_RENT: parseInt(process.env.NEXT_PUBLIC_MAX_RENT || '10000000'),
} as const

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Análisis de Rentabilidad - Arriendos',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@tumatch.cl',
  SUPPORT_PHONE: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+56 9 1234 5678',
} as const

// Función para validar configuración crítica
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validar UF
  if (CURRENCY_CONFIG.UF_VALUE_CLP < 30000 || CURRENCY_CONFIG.UF_VALUE_CLP > 50000) {
    errors.push('UF value seems invalid (should be between 30,000 and 50,000 CLP)')
  }

  // Validar comisiones
  if (DEFAULT_COMMISSIONS.PLAN_A < 5 || DEFAULT_COMMISSIONS.PLAN_A > 20) {
    errors.push('Plan A commission should be between 5% and 20%')
  }

  // Validar configuración de Propital si está habilitada
  if (PROPITAL_CONFIG.INTEGRATION_ENABLED && !PROPITAL_CONFIG.API_KEY) {
    errors.push('Propital integration is enabled but API key is missing')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Función para obtener valor UF actualizado
export async function updateUFValue(): Promise<number | null> {
  if (!CURRENCY_CONFIG.UF_UPDATE_URL) return null

  try {
    const response = await fetch(CURRENCY_CONFIG.UF_UPDATE_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
    })

    if (!response.ok) {
      console.warn('Failed to fetch updated UF value from API')
      return null
    }

    const data = await response.json()
    const ufValue = data.uf || data.value || data.precio

    if (typeof ufValue === 'number' && ufValue > 30000 && ufValue < 50000) {
      return ufValue
    }

    console.warn('Invalid UF value received from API:', ufValue)
    return null
  } catch (error) {
    console.warn('Error fetching UF value:', error)
    return null
  }
}

// Función para formatear moneda según configuración
export function formatCurrency(amount: number, currency: 'CLP' | 'UF' = 'CLP'): string {
  if (currency === 'UF') {
    return `${amount.toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} UF`
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Exportar configuración consolidada para fácil acceso
export const CONFIG = {
  CURRENCY: CURRENCY_CONFIG,
  EXPENSES: DEFAULT_EXPENSES,
  COMMISSIONS: DEFAULT_COMMISSIONS,
  RENTAL_ANALYSIS: RENTAL_ANALYSIS_CONFIG,
  RENTAL_PLANS: RENTAL_PLANS_CONFIG,
  PROPITAL: PROPITAL_CONFIG,
  NOTIFICATIONS: NOTIFICATIONS_CONFIG,
  PDF: PDF_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  APP: APP_CONFIG,
} as const

export default CONFIG