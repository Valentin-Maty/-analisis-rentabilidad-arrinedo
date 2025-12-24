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
      rent_currency: 'CLP',
      capture_price_clp: '',
      capture_price_currency: 'CLP',
      comparable_properties: [],
      
      maintenance_clp: '',
      property_tax_clp: '',
      insurance_clp: '',
      vacancy_percentage: '8.33',
      
      plans_enabled: ['A', 'B', 'C'],
      
      broker_name: '',
      broker_email: '',
      broker_phone: '',
      broker_signature: '',
      
      client_name: '',
      client_email: '',
      client_phone: '',
      
      notes: '',
      tags: []
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
    // Validar que hay comparables
    const comparables = formValues.comparable_properties || []
    if (comparables.length === 0) {
      alert('Por favor, agrega al menos una propiedad comparable')
      return
    }

    // Calcular precio sugerido basado en comparables
    const avgRent = comparables.reduce((sum, c) => sum + (c.rent_clp || 0), 0) / comparables.length
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
          <AnalysisResults 
            analysis={analysisResult}
            onBack={() => setAnalysisResult(null)}
          />
        )}
      </div>
    </div>
  )
}