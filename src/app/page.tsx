'use client'

import { useState } from 'react'
import useRentalProfitability from '@/hooks/useRentalProfitability'
import PropertyFormImproved from '@/components/PropertyFormImproved'
import AnalysisResultsImproved from '@/components/AnalysisResultsImproved'
import AnalysisPreview from '@/components/AnalysisPreview'

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [analysisData, setAnalysisData] = useState<any>(null)
  
  const {
    form,
    formValues,
    calculations,
    marketStudy,
    capRateAnalysis,
    vacancyImpact,
    generateAnalysis,
    suggestInitialRent,
  } = useRentalProfitability()

  const handleAnalyze = () => {
    const analysis = generateAnalysis()
    setAnalysisData(analysis)
    setCurrentStep(2)
  }

  const handleBackToForm = () => {
    setCurrentStep(1)
  }

  const handleStartOver = () => {
    setCurrentStep(1)
    setAnalysisData(null)
    form.reset()
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Paso 1: Información de la Propiedad y Análisis de Rentabilidad'
      case 2: return 'Paso 2: Plan Comercial y Análisis Detallado'
      default: return ''
    }
  }

  const hasCapturePrice = () => {
    const hasCaptureClp = formValues.capture_price_clp && parseFloat(formValues.capture_price_clp) > 0
    const hasCaptureUf = formValues.capture_price_uf && parseFloat(formValues.capture_price_uf) > 0
    return hasCaptureClp || hasCaptureUf
  }

  const isFormValid = () => {
    const hasRent = formValues.suggested_rent_clp || formValues.suggested_rent_uf
    const rentValue = formValues.suggested_rent_clp 
      ? parseFloat(formValues.suggested_rent_clp) 
      : parseFloat(formValues.suggested_rent_uf || '0')
    
    const hasPropertyValue = formValues.property_value_clp || formValues.property_value_uf
    const propertyValue = formValues.property_value_clp 
      ? parseFloat(formValues.property_value_clp) 
      : parseFloat(formValues.property_value_uf || '0')
    
    return hasRent && rentValue > 0 && hasPropertyValue && propertyValue > 0
  }

  return (
    <div className="min-h-screen">
      {/* Header con progreso */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Análisis de Rentabilidad para Arriendos
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Sistema inteligente para generar propuestas comerciales con planes A, B y C
            </p>
          </div>

          {/* Indicador de progreso */}
          <div className="flex items-center justify-center space-x-8 mb-6">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  transition-all duration-300
                  ${step <= currentStep 
                    ? 'bg-blue-700 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                  }
                `}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 2 && (
                  <div className={`
                    w-24 h-1 mx-4 rounded-full transition-all duration-300
                    ${step < currentStep 
                      ? 'bg-blue-700' 
                      : 'bg-gray-200'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-center text-gray-800">
            {getStepTitle()}
          </h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PropertyFormImproved 
                  form={form}
                  formValues={formValues}
                  onSuggestRent={suggestInitialRent}
                />
              </div>
              
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  {/* Vista previa solo cuando hay precio de captación */}
                  {hasCapturePrice() ? (
                    <div className="card">
                      <div className="card-header">
                        <h3 className="text-xl font-semibold text-white">Vista Previa</h3>
                        <p className="text-blue-100 text-sm mt-1">Cálculos en tiempo real</p>
                      </div>
                      <div className="card-body space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="metric-card">
                            <div className="metric-value">
                              {calculations.cap_rate.toFixed(2)}%
                            </div>
                            <div className="metric-label">CAP Rate</div>
                            <div className="tooltip">
                              <span className="text-xs opacity-75 cursor-help">ℹ️ Información</span>
                              <div className="tooltip-content">
                                Rentabilidad anual neta sobre el valor de la propiedad
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border-2 border-gray-100">
                            <div className="text-2xl font-bold text-gray-800">
                              ${calculations.monthly_net_income.toLocaleString('es-CL')}
                            </div>
                            <div className="text-sm text-gray-600">Ingreso Neto Mensual</div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border-2 border-gray-100">
                            <div className="text-2xl font-bold text-orange-600">
                              {calculations.break_even_rent_reduction.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-600">Reducción Máxima Viable</div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-xl border-2 border-gray-100">
                            <div className="text-2xl font-bold text-red-600">
                              ${calculations.vacancy_cost_per_month.toLocaleString('es-CL')}
                            </div>
                            <div className="text-sm text-gray-600">Costo Vacancia/Mes</div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-6">
                          <button
                            onClick={handleAnalyze}
                            className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl"
                          >
                            🚀 Generar Plan Comercial
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card">
                      <div className="card-body text-center py-12">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Complete el Precio de Captación
                        </h3>
                        <p className="text-gray-600">
                          Ingrese el precio de captación en la sección "Precio de Arriendo" para ver los cálculos de rentabilidad en tiempo real.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  📊 Plan Comercial y Análisis Detallado
                </h2>
                <p className="text-gray-600 mt-2">
                  {formValues.property_address || 'Análisis completo de rentabilidad'}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBackToForm}
                  className="btn btn-secondary"
                >
                  ← Volver al Análisis
                </button>
                <button
                  onClick={handleStartOver}
                  className="btn btn-secondary"
                >
                  🔄 Empezar Nuevo
                </button>
              </div>
            </div>

            {/* Plan Comercial y Análisis Detallado */}
            <div className="space-y-8">
              {(formValues.suggested_rent_clp || formValues.suggested_rent_uf) && analysisData ? (
                <>
                  {/* Vista Previa del Plan Comercial */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">📄 Plan Comercial</h3>
                    <AnalysisPreview formValues={formValues} />
                  </div>

                  {/* Análisis Detallado */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Análisis Detallado de Rentabilidad</h3>
                    <AnalysisResultsImproved
                      analysis={analysisData}
                      calculations={calculations}
                      capRateAnalysis={capRateAnalysis}
                      vacancyImpact={vacancyImpact}
                      rentCurrency={formValues.rent_currency}
                      rentValueUF={formValues.suggested_rent_uf ? parseFloat(formValues.suggested_rent_uf) : undefined}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Complete el análisis de rentabilidad para ver el plan comercial y análisis detallado</p>
                  <button
                    onClick={handleBackToForm}
                    className="btn btn-primary mt-4"
                  >
                    ← Completar Análisis
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}