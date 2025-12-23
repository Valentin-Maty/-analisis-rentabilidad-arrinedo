/*
Domain: Rental/Profitability
Responsibility: Hook para manejar análisis de rentabilidad de arriendos con planes A, B y C
Dependencies: React hooks, react-hook-form, tipos de rental
*/

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import type { 
  Property, 
  RentalPlan, 
  RentalAnalysis, 
  RentalAnalysisForm, 
  RentalCalculations,
  CapRateAnalysis,
  VacancyImpact,
  MarketStudy,
  PlanComparison
} from '@/types/rental'

// Valores por defecto del formulario
export const DEFAULT_RENTAL_FORM_VALUES: RentalAnalysisForm = {
  property_address: '',
  property_value_clp: '0',
  property_value_uf: '0',
  property_size_m2: '0',
  bedrooms: '1', // Predeterminado: 1
  bathrooms: '1', // Predeterminado: 1
  parking_spaces: '0', // Predeterminado: 0
  storage_units: '0', // Predeterminado: 0
  suggested_rent_clp: '0',
  suggested_rent_uf: '0',
  rent_currency: 'CLP',
  capture_price_clp: undefined,
  capture_price_uf: undefined,
  capture_price_currency: 'CLP',
  market_study_notes: '',
  plan_a_commission: '12', // 12% anual para plan premium
  plan_b_commission: '10', // 10% anual para plan estándar
  plan_c_commission: '8',  // 8% anual para plan básico
  annual_maintenance_clp: '500000',
  annual_property_tax_clp: '300000', 
  annual_insurance_clp: '200000',
  uf_value_clp: '37000', // Valor aproximado UF 2024
}

// Planes predefinidos A, B, C según especificaciones de Patricio
// IMPORTANTE: Plan A debe tener el MEJOR ingreso neto anual porque se arrienda más rápido
// aunque tenga mayor comisión (12%). La menor vacancia compensa la mayor comisión.
export const DEFAULT_RENTAL_PLANS: RentalPlan[] = [
  {
    id: 'A',
    name: 'Plan Premium',
    description: 'Ajustes frecuentes cada 7-10 días para máxima velocidad de arriendo',
    initial_rent_clp: 0, // Se calcula dinámicamente
    commission_percentage: 12,
    marketing_duration_days: 30,
    service_level: 'premium',
    price_adjustment_schedule: [
      { day: 0, new_rent_clp: 0, percentage_reduction: 0 }, // Días 1-7: Precio inicial
      { day: 7, new_rent_clp: 0, percentage_reduction: 4 }, // Días 8-15: -4%
      { day: 15, new_rent_clp: 0, percentage_reduction: 8 }, // Días 16-22: -8%
      { day: 22, new_rent_clp: 0, percentage_reduction: 12 }, // Días 23-30: -12%
    ]
  },
  {
    id: 'B', 
    name: 'Plan Estándar',
    description: 'Balance ideal con ajustes moderados cada 15 días',
    initial_rent_clp: 0,
    commission_percentage: 10,
    marketing_duration_days: 30,
    service_level: 'standard',
    price_adjustment_schedule: [
      { day: 0, new_rent_clp: 0, percentage_reduction: 0 }, // Días 1-10: Precio inicial
      { day: 10, new_rent_clp: 0, percentage_reduction: 5 }, // Días 11-20: -5%
      { day: 20, new_rent_clp: 0, percentage_reduction: 10 }, // Días 21-30: -10%
    ]
  },
  {
    id: 'C',
    name: 'Plan Básico',
    description: 'Precio estable con ajustes solo después de 20-30 días',
    initial_rent_clp: 0,
    commission_percentage: 8,
    marketing_duration_days: 30,
    service_level: 'basic',
    price_adjustment_schedule: [
      { day: 0, new_rent_clp: 0, percentage_reduction: 0 }, // Días 1-15: Precio inicial
      { day: 15, new_rent_clp: 0, percentage_reduction: 3 }, // Días 16-30: -3%
    ]
  }
]

interface UseRentalProfitabilityProps {
  property?: Property | null;
  ufValue?: number;
}

/**
 * Hook para manejar análisis de rentabilidad de arriendos
 * Incluye cálculos de CAP rate, análisis de vacancia, planes A/B/C
 */
export const useRentalProfitability = ({
  property: initialProperty,
  ufValue: externalUfValue
}: UseRentalProfitabilityProps = {}) => {
  
  // Estados
  const [property, setProperty] = useState<Property | null>(initialProperty || null)
  const [loading, setLoading] = useState(false)

  // Formulario con valores por defecto
  const form = useForm<RentalAnalysisForm>({
    defaultValues: DEFAULT_RENTAL_FORM_VALUES,
  })

  const { watch, setValue } = form
  const formValues = watch()

  // Función para analizar el mercado (simulada - en producción conectaría con API)
  const analyzeMarket = useMemo((): MarketStudy => {
    const sizeM2 = parseFloat(formValues.property_size_m2) || 50
    const baseRentPerM2 = 400 // Base: $400 CLP por m2
    
    // Factores simulados del mercado
    const locationScore = 8 // 1-10
    const transportationScore = 7
    const amenitiesScore = 6

    const marketMultiplier = (locationScore + transportationScore + amenitiesScore) / 30
    const adjustedRentPerM2 = baseRentPerM2 * (0.7 + marketMultiplier * 0.6) // Rango 70%-130%

    return {
      comparable_properties: [], // En producción se cargarían propiedades similares
      average_rent_per_m2: adjustedRentPerM2,
      market_range: {
        min_rent_clp: sizeM2 * adjustedRentPerM2 * 0.85,
        max_rent_clp: sizeM2 * adjustedRentPerM2 * 1.15,
      },
      neighborhood_factors: {
        location_score: locationScore,
        transportation_access: transportationScore,
        amenities_score: amenitiesScore,
      }
    }
  }, [formValues.property_size_m2])

  // Función para calcular CAP rate para arriendos
  const calculateCapRate = useMemo((): CapRateAnalysis => {
    // Usar valor en pesos como principal
    const propertyValueCLP = parseFloat(formValues.property_value_clp) || 0
    const ufValueCLP = parseFloat(formValues.uf_value_clp) || 38000
    
    // Calcular precio en CLP considerando la moneda seleccionada
    let suggestedRentCLP = 0
    if (formValues.rent_currency === 'UF') {
      const rentUF = parseFloat(formValues.suggested_rent_uf) || 0
      suggestedRentCLP = rentUF * ufValueCLP
    } else {
      suggestedRentCLP = parseFloat(formValues.suggested_rent_clp) || 0
    }
    
    const annualRentalIncome = suggestedRentCLP * 12
    
    const maintenance = parseFloat(formValues.annual_maintenance_clp) || 0
    const propertyTax = parseFloat(formValues.annual_property_tax_clp) || 0
    const insurance = parseFloat(formValues.annual_insurance_clp) || 0
    const annualExpenses = maintenance + propertyTax + insurance
    
    const netOperatingIncome = annualRentalIncome - annualExpenses
    const capRate = propertyValueCLP > 0 ? (netOperatingIncome / propertyValueCLP) * 100 : 0
    
    // Determinar comparación con el mercado (simplificado)
    let comparison: 'above' | 'average' | 'below' = 'average'
    if (capRate > 6) comparison = 'above'
    else if (capRate < 4) comparison = 'below'

    return {
      property_value_clp: propertyValueCLP,
      annual_rental_income: annualRentalIncome,
      annual_expenses: annualExpenses,
      net_operating_income: netOperatingIncome,
      cap_rate_percentage: capRate,
      comparison_to_market: comparison
    }
  }, [formValues])

  // Función para calcular impacto de vacancia
  const calculateVacancyImpact = useMemo((): VacancyImpact => {
    // Calcular precio en CLP considerando la moneda seleccionada
    let monthlyRentCLP = 0
    if (formValues.rent_currency === 'UF') {
      const rentUF = parseFloat(formValues.suggested_rent_uf) || 0
      const ufValueCLP = parseFloat(formValues.uf_value_clp) || 38000
      monthlyRentCLP = rentUF * ufValueCLP
    } else {
      monthlyRentCLP = parseFloat(formValues.suggested_rent_clp) || 0
    }
    
    // Cada mes vacante representa 8.33% de pérdida anual (12 meses)
    const vacancyImpactPerMonth = 8.33
    
    // Calculamos cuánto se puede reducir el precio para evitar 1 mes de vacancia
    const oneMonthLoss = monthlyRentCLP
    const maxReductionToBreakEven = (oneMonthLoss / (monthlyRentCLP * 11)) * 100 // % que se puede reducir por 11 meses para igualar 1 mes perdido

    return {
      days_vacant: 30, // Ejemplo: 1 mes
      percentage_annual_loss: vacancyImpactPerMonth,
      lost_income_clp: monthlyRentCLP,
      break_even_reduction_percentage: maxReductionToBreakEven
    }
  }, [formValues.suggested_rent_clp, formValues.suggested_rent_uf, formValues.rent_currency, formValues.uf_value_clp])

  // Función para generar planes con precios ajustados
  const generateRentalPlans = useMemo((): RentalPlan[] => {
    // Calcular precio base en CLP considerando la moneda seleccionada
    let baseRentCLP = 0
    if (formValues.rent_currency === 'UF') {
      const rentUF = parseFloat(formValues.suggested_rent_uf) || 0
      const ufValueCLP = parseFloat(formValues.uf_value_clp) || 38000
      baseRentCLP = rentUF * ufValueCLP
    } else {
      baseRentCLP = parseFloat(formValues.suggested_rent_clp) || 0
    }
    
    return DEFAULT_RENTAL_PLANS.map(plan => ({
      ...plan,
      initial_rent_clp: baseRentCLP,
      commission_percentage: parseFloat(formValues[`plan_${plan.id.toLowerCase()}_commission` as keyof RentalAnalysisForm] as string) || plan.commission_percentage,
      price_adjustment_schedule: plan.price_adjustment_schedule.map(adjustment => ({
        ...adjustment,
        new_rent_clp: baseRentCLP * (1 - adjustment.percentage_reduction / 100)
      }))
    }))
  }, [formValues.suggested_rent_clp, formValues.suggested_rent_uf, formValues.rent_currency, formValues.uf_value_clp, formValues.plan_a_commission, formValues.plan_b_commission, formValues.plan_c_commission])

  // Función para comparar planes
  const comparePlans = useMemo((): PlanComparison[] => {
    // Calcular precio base en CLP considerando la moneda seleccionada
    let baseRentCLP = 0
    if (formValues.rent_currency === 'UF') {
      const rentUF = parseFloat(formValues.suggested_rent_uf) || 0
      const ufValueCLP = parseFloat(formValues.uf_value_clp) || 38000
      baseRentCLP = rentUF * ufValueCLP
    } else {
      baseRentCLP = parseFloat(formValues.suggested_rent_clp) || 0
    }
    
    return generateRentalPlans.map(plan => {
      // Tiempo esperado de arriendo según plan (más agresivo = menos días)
      let expectedRentalTime: number
      let monthsVacant: number // Meses de vacancia estimados
      
      if (plan.id === 'A') {
        expectedRentalTime = 7 // Plan A se arrienda más rápido (día 7)
        monthsVacant = 0.25 // Solo 0.25 meses de vacancia
      } else if (plan.id === 'B') {
        expectedRentalTime = 12 // Plan B tiempo medio (día 12)
        monthsVacant = 0.4 // 0.4 meses de vacancia
      } else {
        expectedRentalTime = 20 // Plan C más lento (día 20)
        monthsVacant = 0.67 // 0.67 meses de vacancia
      }
      
      // Calcular precio promedio considerando ajustes
      let avgRentCLP = baseRentCLP
      if (plan.price_adjustment_schedule.length > 1) {
        const lastAdjustment = plan.price_adjustment_schedule[plan.price_adjustment_schedule.length - 1]
        avgRentCLP = baseRentCLP * (1 - lastAdjustment.percentage_reduction / 200) // Promedio entre inicial y final
      }
      
      // Meses efectivos de arriendo (12 - meses vacantes)
      const effectiveMonths = 12 - monthsVacant
      
      // Ingreso bruto anual considerando vacancia
      const annualRentWithVacancy = avgRentCLP * effectiveMonths
      
      // Comisión sobre el ingreso efectivo
      const totalCommission = annualRentWithVacancy * (plan.commission_percentage / 100)
      
      // Ingreso neto anual (después de comisión y considerando vacancia)
      const netAnnualIncome = annualRentWithVacancy - totalCommission
      
      // Score de riesgo de vacancia (Plan A menor riesgo, Plan C mayor riesgo)
      const vacancyRiskScore = plan.id === 'A' ? 2 : plan.id === 'B' ? 5 : 8
      
      // Score de recomendación basado en ingreso neto
      const recommendationScore = plan.id === 'A' ? 9 : plan.id === 'B' ? 7 : 5

      return {
        plan_id: plan.id,
        expected_rental_time: expectedRentalTime,
        total_commission: totalCommission,
        net_annual_income: netAnnualIncome,
        vacancy_risk_score: vacancyRiskScore,
        recommendation_score: recommendationScore
      }
    })
  }, [generateRentalPlans, formValues.suggested_rent_clp, formValues.suggested_rent_uf, formValues.rent_currency, formValues.uf_value_clp])

  // Cálculos consolidados
  const calculations = useMemo((): RentalCalculations => {
    const capRateAnalysis = calculateCapRate
    const vacancyImpact = calculateVacancyImpact
    
    return {
      cap_rate: capRateAnalysis.cap_rate_percentage,
      annual_rental_yield: (capRateAnalysis.annual_rental_income / capRateAnalysis.property_value_clp) * 100,
      monthly_net_income: capRateAnalysis.net_operating_income / 12,
      vacancy_cost_per_month: vacancyImpact.lost_income_clp,
      break_even_rent_reduction: vacancyImpact.break_even_reduction_percentage,
      plan_comparisons: comparePlans
    }
  }, [calculateCapRate, calculateVacancyImpact, comparePlans])

  // Función para generar análisis completo
  const generateAnalysis = (): RentalAnalysis => {
    // Calcular precio de mercado en CLP considerando la moneda seleccionada
    let marketRentCLP = 0
    if (formValues.rent_currency === 'UF') {
      const rentUF = parseFloat(formValues.suggested_rent_uf) || 0
      const ufValueCLP = parseFloat(formValues.uf_value_clp) || 38000
      marketRentCLP = rentUF * ufValueCLP
    } else {
      marketRentCLP = parseFloat(formValues.suggested_rent_clp) || 0
    }

    const currentProperty: Property = property || {
      id: 'temp-property',
      address: formValues.property_address,
      value_clp: parseFloat(formValues.property_value_clp) || 0,
      value_uf: formValues.property_value_uf ? parseFloat(formValues.property_value_uf) : 0,
      market_rent_clp: marketRentCLP,
      size_m2: parseFloat(formValues.property_size_m2) || undefined,
      bedrooms: parseInt(formValues.bedrooms) || undefined,
      bathrooms: parseInt(formValues.bathrooms) || undefined,
      parking_spaces: parseInt(formValues.parking_spaces) || undefined,
      storage_units: parseInt(formValues.storage_units) || undefined
    }

    return {
      property: currentProperty,
      plans: generateRentalPlans,
      market_study: analyzeMarket,
      cap_rate_analysis: calculateCapRate,
      vacancy_impact: calculateVacancyImpact,
      recommended_initial_rent: marketRentCLP
    }
  }

  // Función para cargar datos de una propiedad
  const loadProperty = (propertyData: Property) => {
    setProperty(propertyData)
    setValue('property_address', propertyData.address)
    setValue('property_value_clp', propertyData.value_clp.toString())
    if (propertyData.value_uf) setValue('property_value_uf', propertyData.value_uf.toString())
    setValue('suggested_rent_clp', propertyData.market_rent_clp.toString())
    if (propertyData.size_m2) setValue('property_size_m2', propertyData.size_m2.toString())
    if (propertyData.bedrooms) setValue('bedrooms', propertyData.bedrooms.toString())
    if (propertyData.bathrooms) setValue('bathrooms', propertyData.bathrooms.toString())
    if (propertyData.parking_spaces) setValue('parking_spaces', propertyData.parking_spaces.toString())
    if (propertyData.storage_units) setValue('storage_units', propertyData.storage_units.toString())
  }

  // Función para sugerir precio inicial basado en estudio de mercado
  const suggestInitialRent = () => {
    const sizeM2 = parseFloat(formValues.property_size_m2) || 0
    if (sizeM2 > 0) {
      const suggestedRent = Math.round(sizeM2 * analyzeMarket.average_rent_per_m2)
      setValue('suggested_rent_clp', suggestedRent.toString())
    }
  }

  return {
    // Formulario y valores
    form,
    formValues,
    defaultValues: DEFAULT_RENTAL_FORM_VALUES,
    
    // Estados
    property,
    loading,
    
    // Cálculos
    calculations,
    marketStudy: analyzeMarket,
    capRateAnalysis: calculateCapRate,
    vacancyImpact: calculateVacancyImpact,
    rentalPlans: generateRentalPlans,
    planComparisons: comparePlans,
    
    // Funciones de utilidad
    loadProperty,
    generateAnalysis,
    suggestInitialRent,
    setLoading,
    setProperty
  }
}

export default useRentalProfitability