import { useMemo } from 'react'
import type { RentalAnalysisForm } from '@/types/rental'

interface RentalCalculationsParams {
  formValues: RentalAnalysisForm
}

interface RentalCalculationsResult {
  baseRent: number
  propertyValue: number
  annualGrossYield: number
  monthlyNetIncome: number
  annualNetIncome: number
  capRate: number
  isUfCurrency: boolean
  ufValue: number
  monthlyExpenses: number
  annualExpenses: number
}

/**
 * Hook personalizado para cálculos memoizados de análisis de rentabilidad
 * Evita recálculos innecesarios cuando los valores de entrada no cambian
 */
export function useRentalCalculations({ formValues }: RentalCalculationsParams): RentalCalculationsResult {
  
  // Memoizar valor UF y determinar si es moneda UF
  const ufValue = useMemo(() => parseFloat(formValues.uf_value_clp || '37000'), [formValues.uf_value_clp])
  const isUfCurrency = useMemo(() => formValues.rent_currency === 'UF', [formValues.rent_currency])

  // Memoizar cálculo de renta base en CLP
  const baseRent = useMemo(() => {
    if (isUfCurrency) {
      return parseFloat(formValues.suggested_rent_uf || '0') * ufValue
    } else {
      return parseFloat(formValues.suggested_rent_clp || '0')
    }
  }, [isUfCurrency, formValues.suggested_rent_uf, formValues.suggested_rent_clp, ufValue])

  // Memoizar valor de la propiedad en CLP
  const propertyValue = useMemo(() => {
    if (formValues.property_value_clp) {
      return parseFloat(formValues.property_value_clp)
    } else if (formValues.property_value_uf) {
      return parseFloat(formValues.property_value_uf) * ufValue
    }
    return 0
  }, [formValues.property_value_clp, formValues.property_value_uf, ufValue])

  // Memoizar gastos mensuales y anuales
  const monthlyExpenses = useMemo(() => {
    const maintenance = parseFloat(formValues.annual_maintenance_clp || '0') / 12
    const propertyTax = parseFloat(formValues.annual_property_tax_clp || '0') / 12
    const insurance = parseFloat(formValues.annual_insurance_clp || '0') / 12
    return maintenance + propertyTax + insurance
  }, [
    formValues.annual_maintenance_clp,
    formValues.annual_property_tax_clp,
    formValues.annual_insurance_clp
  ])

  const annualExpenses = useMemo(() => {
    return monthlyExpenses * 12
  }, [monthlyExpenses])

  // Memoizar ingresos netos
  const monthlyNetIncome = useMemo(() => {
    return baseRent - monthlyExpenses
  }, [baseRent, monthlyExpenses])

  const annualNetIncome = useMemo(() => {
    return monthlyNetIncome * 12
  }, [monthlyNetIncome])

  // Memoizar rentabilidad anual bruta
  const annualGrossYield = useMemo(() => {
    if (!propertyValue || propertyValue === 0) return 0
    return ((baseRent * 12) / propertyValue * 100)
  }, [baseRent, propertyValue])

  // Memoizar CAP Rate (rentabilidad neta)
  const capRate = useMemo(() => {
    if (!propertyValue || propertyValue === 0) return 0
    return (annualNetIncome / propertyValue * 100)
  }, [annualNetIncome, propertyValue])

  return {
    baseRent,
    propertyValue,
    annualGrossYield,
    monthlyNetIncome,
    annualNetIncome,
    capRate,
    isUfCurrency,
    ufValue,
    monthlyExpenses,
    annualExpenses
  }
}

export default useRentalCalculations