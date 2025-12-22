/**
 * Formatea números automáticamente con puntos como separador de miles
 * Para uso en campos de input y visualización
 */

export const formatNumber = (value: string | number): string => {
  if (!value && value !== 0) return ''
  
  // Convertir a string y limpiar
  const cleanValue = value.toString().replace(/\D/g, '')
  if (!cleanValue) return ''
  
  // Agregar puntos como separadores de miles
  return parseInt(cleanValue).toLocaleString('es-CL')
}

export const unformatNumber = (value: string): string => {
  if (!value) return ''
  // Remover todos los puntos y comas para obtener el número puro
  return value.replace(/[.,]/g, '')
}

export const handleNumberInput = (
  value: string,
  onChange: (value: string) => void
) => {
  // Limpiar valor (solo números)
  const cleanValue = unformatNumber(value)
  
  // Actualizar con el valor limpio (sin formato)
  onChange(cleanValue)
  
  // Retornar valor formateado para mostrar en input
  return formatNumber(cleanValue)
}

export const formatCurrency = (value: string | number, currency = 'CLP'): string => {
  if (!value && value !== 0) return `0 ${currency}`
  
  const numericValue = typeof value === 'string' ? parseFloat(unformatNumber(value)) : value
  if (isNaN(numericValue)) return `0 ${currency}`
  
  return `${numericValue.toLocaleString('es-CL')} ${currency}`
}