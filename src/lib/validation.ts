/*
Domain: Input Validation
Responsibility: Validación de entrada para APIs y formularios
Dependencies: Zod para validación de esquemas
*/

// Esquemas de validación para diferentes tipos de datos

export interface ValidationResult<T = any> {
  isValid: boolean
  data?: T
  errors: string[]
}

// Validación de propiedad
export interface PropertyValidationSchema {
  address: string
  value_clp: number
  value_uf?: number
  size_m2: number
  bedrooms: number
  bathrooms: number
  parking_spaces?: number
  storage_units?: number
}

export function validateProperty(data: any): ValidationResult<PropertyValidationSchema> {
  const errors: string[] = []

  // Validar dirección
  if (!data.address || typeof data.address !== 'string' || data.address.trim().length < 5) {
    errors.push('La dirección debe tener al menos 5 caracteres')
  }

  // Validar valor en pesos
  const value_clp = parseFloat(data.value_clp)
  if (!value_clp || value_clp < 10000000 || value_clp > 1000000000) {
    errors.push('El valor de la propiedad debe estar entre $10.000.000 y $1.000.000.000 CLP')
  }

  // Validar valor UF (opcional)
  let value_uf: number | undefined
  if (data.value_uf) {
    value_uf = parseFloat(data.value_uf)
    if (value_uf < 300 || value_uf > 30000) {
      errors.push('El valor en UF debe estar entre 300 y 30.000 UF')
    }
  }

  // Validar metros cuadrados
  const size_m2 = parseFloat(data.size_m2)
  if (!size_m2 || size_m2 < 20 || size_m2 > 1000) {
    errors.push('Los metros cuadrados deben estar entre 20 y 1.000 m²')
  }

  // Validar dormitorios
  const bedrooms = parseInt(data.bedrooms)
  if (!bedrooms || bedrooms < 1 || bedrooms > 10) {
    errors.push('Los dormitorios deben estar entre 1 y 10')
  }

  // Validar baños
  const bathrooms = parseInt(data.bathrooms)
  if (!bathrooms || bathrooms < 1 || bathrooms > 10) {
    errors.push('Los baños deben estar entre 1 y 10')
  }

  // Validar estacionamientos (opcional)
  let parking_spaces: number | undefined
  if (data.parking_spaces !== undefined) {
    parking_spaces = parseInt(data.parking_spaces)
    if (parking_spaces < 0 || parking_spaces > 10) {
      errors.push('Los estacionamientos deben estar entre 0 y 10')
    }
  }

  // Validar bodegas (opcional)
  let storage_units: number | undefined
  if (data.storage_units !== undefined) {
    storage_units = parseInt(data.storage_units)
    if (storage_units < 0 || storage_units > 5) {
      errors.push('Las bodegas deben estar entre 0 y 5')
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    data: {
      address: data.address.trim(),
      value_clp,
      value_uf,
      size_m2,
      bedrooms,
      bathrooms,
      parking_spaces,
      storage_units
    },
    errors: []
  }
}

// Validación de análisis de rentabilidad
export interface RentalAnalysisValidationSchema {
  property: PropertyValidationSchema
  suggested_rent_clp: number
  suggested_rent_uf?: number
  rent_currency: 'CLP' | 'UF'
  annual_maintenance_clp: number
  annual_property_tax_clp: number
  annual_insurance_clp: number
  plan_a_commission: number
  plan_b_commission: number
  plan_c_commission: number
}

export function validateRentalAnalysis(data: any): ValidationResult<RentalAnalysisValidationSchema> {
  const errors: string[] = []

  // Validar propiedad
  const propertyValidation = validateProperty(data.property || data)
  if (!propertyValidation.isValid) {
    errors.push(...propertyValidation.errors)
  }

  // Validar renta sugerida
  const rent_currency = data.rent_currency || 'CLP'
  if (!['CLP', 'UF'].includes(rent_currency)) {
    errors.push('La moneda debe ser CLP o UF')
  }

  let suggested_rent_clp: number
  let suggested_rent_uf: number | undefined

  if (rent_currency === 'CLP') {
    suggested_rent_clp = parseFloat(data.suggested_rent_clp)
    if (!suggested_rent_clp || suggested_rent_clp < 100000 || suggested_rent_clp > 10000000) {
      errors.push('La renta en CLP debe estar entre $100.000 y $10.000.000')
    }
  } else {
    suggested_rent_uf = parseFloat(data.suggested_rent_uf)
    if (!suggested_rent_uf || suggested_rent_uf < 3 || suggested_rent_uf > 300) {
      errors.push('La renta en UF debe estar entre 3 y 300 UF')
    }
    // Convertir a CLP para validaciones internas
    const uf_value = parseFloat(data.uf_value_clp) || 38000
    suggested_rent_clp = suggested_rent_uf * uf_value
  }

  // Validar gastos anuales
  const annual_maintenance_clp = parseFloat(data.annual_maintenance_clp)
  if (!annual_maintenance_clp || annual_maintenance_clp < 0 || annual_maintenance_clp > 10000000) {
    errors.push('El mantenimiento anual debe estar entre $0 y $10.000.000')
  }

  const annual_property_tax_clp = parseFloat(data.annual_property_tax_clp)
  if (!annual_property_tax_clp || annual_property_tax_clp < 0 || annual_property_tax_clp > 5000000) {
    errors.push('Las contribuciones anuales deben estar entre $0 y $5.000.000')
  }

  const annual_insurance_clp = parseFloat(data.annual_insurance_clp)
  if (!annual_insurance_clp || annual_insurance_clp < 0 || annual_insurance_clp > 2000000) {
    errors.push('El seguro anual debe estar entre $0 y $2.000.000')
  }

  // Validar comisiones
  const plan_a_commission = parseFloat(data.plan_a_commission)
  if (!plan_a_commission || plan_a_commission < 5 || plan_a_commission > 25) {
    errors.push('La comisión del Plan A debe estar entre 5% y 25%')
  }

  const plan_b_commission = parseFloat(data.plan_b_commission)
  if (!plan_b_commission || plan_b_commission < 5 || plan_b_commission > 25) {
    errors.push('La comisión del Plan B debe estar entre 5% y 25%')
  }

  const plan_c_commission = parseFloat(data.plan_c_commission)
  if (!plan_c_commission || plan_c_commission < 5 || plan_c_commission > 25) {
    errors.push('La comisión del Plan C debe estar entre 5% y 25%')
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    data: {
      property: propertyValidation.data!,
      suggested_rent_clp,
      suggested_rent_uf,
      rent_currency: rent_currency as 'CLP' | 'UF',
      annual_maintenance_clp,
      annual_property_tax_clp,
      annual_insurance_clp,
      plan_a_commission,
      plan_b_commission,
      plan_c_commission
    },
    errors: []
  }
}

// Validación de cliente
export interface ClientValidationSchema {
  name: string
  email: string
  phone?: string
  rut?: string
}

export function validateClient(data: any): ValidationResult<ClientValidationSchema> {
  const errors: string[] = []

  // Validar nombre
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres')
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Debe proporcionar un email válido')
  }

  // Validar teléfono (opcional)
  let phone: string | undefined
  if (data.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('El teléfono debe tener un formato válido')
    } else {
      phone = data.phone.trim()
    }
  }

  // Validar RUT (opcional, formato chileno)
  let rut: string | undefined
  if (data.rut) {
    const rutRegex = /^[0-9]+-[0-9kK]{1}$/
    if (!rutRegex.test(data.rut)) {
      errors.push('El RUT debe tener formato válido (12345678-9)')
    } else {
      rut = data.rut.trim().toUpperCase()
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone,
      rut
    },
    errors: []
  }
}

// Validación de ID y parámetros de ruta
export function validateId(id: string): ValidationResult<string> {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return { isValid: false, errors: ['ID es requerido'] }
  }

  // Permitir IDs alfanuméricos, guiones y guiones bajos
  const idRegex = /^[a-zA-Z0-9\-_]+$/
  if (!idRegex.test(id)) {
    return { isValid: false, errors: ['ID contiene caracteres inválidos'] }
  }

  if (id.length > 50) {
    return { isValid: false, errors: ['ID es demasiado largo'] }
  }

  return { isValid: true, data: id.trim(), errors: [] }
}

// Validación de paginación
export interface PaginationValidationSchema {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function validatePagination(data: any): ValidationResult<PaginationValidationSchema> {
  const errors: string[] = []

  // Validar página
  const page = parseInt(data.page) || 1
  if (page < 1 || page > 1000) {
    errors.push('La página debe estar entre 1 y 1000')
  }

  // Validar límite
  const limit = parseInt(data.limit) || 10
  if (limit < 1 || limit > 100) {
    errors.push('El límite debe estar entre 1 y 100')
  }

  // Validar ordenamiento (opcional)
  let sortBy: string | undefined
  let sortOrder: 'asc' | 'desc' | undefined

  if (data.sortBy) {
    const allowedSortFields = ['created_at', 'updated_at', 'title', 'property_value', 'status']
    if (!allowedSortFields.includes(data.sortBy)) {
      errors.push('Campo de ordenamiento no válido')
    } else {
      sortBy = data.sortBy
    }
  }

  if (data.sortOrder) {
    if (!['asc', 'desc'].includes(data.sortOrder)) {
      errors.push('Orden debe ser "asc" o "desc"')
    } else {
      sortOrder = data.sortOrder as 'asc' | 'desc'
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    data: {
      page,
      limit,
      sortBy,
      sortOrder
    },
    errors: []
  }
}

// Middleware de validación para APIs
export function createValidationMiddleware<T>(
  validator: (data: any) => ValidationResult<T>
) {
  return (data: any): ValidationResult<T> => {
    try {
      return validator(data)
    } catch (error) {
      return {
        isValid: false,
        errors: ['Error de validación: ' + (error instanceof Error ? error.message : 'Error desconocido')]
      }
    }
  }
}

// Utilidad para sanitizar strings
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"']/g, '') // Remover caracteres potencialmente peligrosos
}

// Utilidad para validar archivos
export interface FileValidationSchema {
  filename: string
  size: number
  type: string
}

export function validateFile(file: any, allowedTypes: string[], maxSizeMB: number = 5): ValidationResult<FileValidationSchema> {
  const errors: string[] = []

  if (!file) {
    errors.push('Archivo es requerido')
    return { isValid: false, errors }
  }

  // Validar nombre
  if (!file.name || typeof file.name !== 'string') {
    errors.push('Nombre de archivo inválido')
  }

  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`)
  }

  // Validar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    errors.push(`Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
  }

  if (errors.length > 0) {
    return { isValid: false, errors }
  }

  return {
    isValid: true,
    data: {
      filename: sanitizeString(file.name, 255),
      size: file.size,
      type: file.type
    },
    errors: []
  }
}

export default {
  validateProperty,
  validateRentalAnalysis,
  validateClient,
  validateId,
  validatePagination,
  validateFile,
  createValidationMiddleware,
  sanitizeString
}