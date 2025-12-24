'use client'

import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import PropertyFormImproved from '@/components/PropertyFormImproved'
import AnalysisResults from '@/components/AnalysisResults'
import type { RentalAnalysisForm, RentalAnalysis } from '@/types/rental'
import { performAnalysis } from '@/lib/analysisEngine'

export default function NewAnalysisPage() {
  const form = useForm<RentalAnalysisForm>({
    defaultValues: {
      property_address: '',
      property_value_clp: '',
      property_value_uf: '',
      property_size_m2: '',
      bedrooms: '2',
      bathrooms: '1',
      parking_spaces: '0',
      storage_units: '0',
      
      suggested_rent_clp: '',
      suggested_rent_uf: '',
      rent_currency: 'CLP',
      capture_price_clp: '',
      capture_price_uf: '',
      capture_price_currency: 'CLP',
      
      market_study_notes: '',
      
      plan_a_commission: '50',
      plan_b_commission: '75', 
      plan_c_commission: '100',
      
      annual_maintenance_clp: '',
      annual_property_tax_clp: '',
      annual_insurance_clp: '',
      
      uf_value_clp: '38000',
      
      comparable_1_link: '',
      comparable_1_address: '',
      comparable_1_m2: '',
      comparable_1_bedrooms: '',
      comparable_1_bathrooms: '',
      comparable_1_parking: '',
      comparable_1_storage: '',
      comparable_1_price: '',
      
      comparable_2_link: '',
      comparable_2_address: '',
      comparable_2_m2: '',
      comparable_2_bedrooms: '',
      comparable_2_bathrooms: '',
      comparable_2_parking: '',
      comparable_2_storage: '',
      comparable_2_price: '',
      
      comparable_3_link: '',
      comparable_3_address: '',
      comparable_3_m2: '',
      comparable_3_bedrooms: '',
      comparable_3_bathrooms: '',
      comparable_3_parking: '',
      comparable_3_storage: '',
      comparable_3_price: ''
    }
  })

  const formValues = form.watch()
  const [analysisResult, setAnalysisResult] = useState<RentalAnalysis | null>(null)

  // Cargar datos desde sessionStorage si vienen de Quick Analysis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const quickData = sessionStorage.getItem('quickAnalysisData')
      if (quickData) {
        try {
          const data = JSON.parse(quickData)
          
          // Prellenar campos con datos del análisis rápido
          if (data.propertyAddress) {
            form.setValue('property_address', data.propertyAddress)
          }
          if (data.propertyM2) {
            form.setValue('property_size_m2', data.propertyM2)
          }
          if (data.suggestedPrice) {
            form.setValue('suggested_rent_clp', data.suggestedPrice.toString())
            form.setValue('capture_price_clp', data.suggestedPrice.toString())
          }
          
          // Limpiar datos temporales
          sessionStorage.removeItem('quickAnalysisData')
        } catch (error) {
          console.error('Error loading quick analysis data:', error)
        }
      }
    }
  }, [form])

  const handleSuggestRent = () => {
    // Construir array de comparables desde los campos individuales
    const comparables = []
    
    if (formValues.comparable_1_price && formValues.comparable_1_m2) {
      comparables.push({
        rent_clp: parseFloat(formValues.comparable_1_price),
        size_m2: parseFloat(formValues.comparable_1_m2)
      })
    }
    
    if (formValues.comparable_2_price && formValues.comparable_2_m2) {
      comparables.push({
        rent_clp: parseFloat(formValues.comparable_2_price),
        size_m2: parseFloat(formValues.comparable_2_m2)
      })
    }
    
    if (formValues.comparable_3_price && formValues.comparable_3_m2) {
      comparables.push({
        rent_clp: parseFloat(formValues.comparable_3_price),
        size_m2: parseFloat(formValues.comparable_3_m2)
      })
    }
    
    if (comparables.length === 0) {
      alert('Por favor, agrega al menos una propiedad comparable')
      return
    }

    // Calcular precio sugerido basado en comparables
    const avgRent = comparables.reduce((sum, c) => sum + c.rent_clp, 0) / comparables.length
    form.setValue('suggested_rent_clp', Math.round(avgRent).toString())
  }

  const handleAnalyze = () => {
    // Validar datos mínimos
    if (!formValues.property_address) {
      alert('Por favor, ingresa la dirección de la propiedad')
      return
    }

    if (!formValues.suggested_rent_clp) {
      alert('Por favor, calcula o ingresa el precio de arriendo sugerido')
      return
    }

    // Realizar análisis
    const result = performAnalysis(formValues)
    setAnalysisResult(result)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto py-8">
        {!analysisResult ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900">📊 Análisis Completo de Rentabilidad</h1>
              <p className="text-gray-600 mt-2">
                Completa todos los datos para generar un análisis profesional con planes comerciales
              </p>
            </div>
            
            <PropertyFormImproved 
              form={form}
              formValues={formValues}
              onSuggestRent={handleSuggestRent}
            />
            
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAnalyze}
                className="btn btn-primary btn-lg flex items-center space-x-2"
              >
                <span>📈</span>
                <span>Generar Análisis Completo</span>
              </button>
            </div>
          </>
        ) : (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setAnalysisResult(null)}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <span>←</span>
                <span>Volver al Formulario</span>
              </button>
            </div>
            <AnalysisResults 
              analysis={analysisResult}
              calculations={{
                cap_rate: analysisResult.cap_rate_analysis.cap_rate_percentage,
                annual_rental_yield: analysisResult.cap_rate_analysis.annual_rental_income > 0 && analysisResult.property.value_clp > 0
                  ? (analysisResult.cap_rate_analysis.annual_rental_income / analysisResult.property.value_clp) * 100
                  : 0,
                monthly_net_income: analysisResult.cap_rate_analysis.net_operating_income / 12,
                vacancy_cost_per_month: analysisResult.vacancy_impact.lost_income_clp / 12,
                break_even_rent_reduction: analysisResult.vacancy_impact.break_even_reduction_percentage,
                plan_comparisons: analysisResult.plans.map(plan => {
                  // Calcular renta final del último ajuste o usar inicial
                  const finalRent = plan.price_adjustment_schedule && plan.price_adjustment_schedule.length > 0
                    ? plan.price_adjustment_schedule[plan.price_adjustment_schedule.length - 1].new_rent_clp
                    : plan.initial_rent_clp
                  
                  return {
                    plan_id: plan.id,
                    expected_rental_time: plan.marketing_duration_days || 30,
                    total_commission: finalRent * (plan.commission_percentage / 100),
                    net_annual_income: finalRent * 12 * 0.9, // Aproximado con 10% gastos
                    vacancy_risk_score: plan.id === 'A' ? 2 : plan.id === 'B' ? 4 : 6, // A=menor riesgo, C=mayor riesgo
                    recommendation_score: plan.id === 'A' ? 9 : plan.id === 'B' ? 7 : 5 // A=mejor recomendación
                  }
                })
              }}
              capRateAnalysis={analysisResult.cap_rate_analysis}
              vacancyImpact={analysisResult.vacancy_impact}
            />
          </div>
        )}
      </div>
    </div>
  )
}