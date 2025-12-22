'use client'

import { useState } from 'react'
import type { RentalPlan, RentalAnalysis, PlanComparison } from '@/types/rental'
import { generateRentalAnalysisPDF } from '@/utils/pdfGenerator'

interface RentalPlansProps {
  plans: RentalPlan[]
  planComparisons: PlanComparison[]
  analysis: RentalAnalysis
}

export default function RentalPlans({ plans, planComparisons, analysis }: RentalPlansProps) {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    )
  }

  const getPlanComparison = (planId: string) => {
    return planComparisons.find(comp => comp.plan_id === planId)
  }

  const getRecommendationColor = (score: number) => {
    if (score >= 8) return 'text-success-600'
    if (score >= 6) return 'text-warning-600'
    return 'text-error-600'
  }

  const getRecommendationText = (score: number) => {
    if (score >= 8) return 'Altamente Recomendado'
    if (score >= 6) return 'Recomendado'
    return 'No Recomendado'
  }

  const handleGeneratePDF = () => {
    if (selectedPlans.length === 0) {
      alert('Debe seleccionar al menos un plan para generar el PDF')
      return
    }

    try {
      generateRentalAnalysisPDF({
        analysis,
        selectedPlanIds: selectedPlans,
        planComparisons,
        brokerInfo: {
          name: 'Juan Pérez', // En producción vendría del usuario logueado
          email: 'juan.perez@tumatch.cl',
          phone: '+56 9 1234 5678',
          company: 'TuMatch'
        }
      })
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar el PDF. Intente nuevamente.')
    }
  }

  const handleSendToClient = () => {
    if (selectedPlans.length === 0) {
      alert('Debe seleccionar al menos un plan para enviar al cliente')
      return
    }

    // En producción, esto generaría un token único y enviaría un email al cliente
    const token = 'demo-' + Math.random().toString(36).substr(2, 9)
    const clientUrl = `${window.location.origin}/cliente/${token}`
    
    // Simular envío de email
    const emailSubject = `Propuesta de Arriendo - ${analysis.property.address}`
    const emailBody = `
Estimado cliente,

Le enviamos la propuesta de arriendo para su propiedad ubicada en ${analysis.property.address}.

Por favor revise los planes seleccionados y confirme su aceptación a través del siguiente enlace:
${clientUrl}

Los planes incluidos son: ${selectedPlans.join(', ')}

Este análisis es válido por 30 días.

Saludos cordiales,
TuMatch Arriendos
    `.trim()
    
    // Abrir cliente de email
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.open(mailtoLink)
    
    alert(`Se ha generado el enlace para el cliente:\n${clientUrl}\n\nSe abrirá su cliente de email para enviar la propuesta.`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Planes Comerciales</h3>
          <p className="text-gray-600 mt-1">
            Selecciona los planes que deseas presentar al cliente
          </p>
        </div>
        <div className="space-x-3">
          <button
            onClick={handleGeneratePDF}
            className="btn btn-secondary"
            disabled={selectedPlans.length === 0}
          >
            Generar PDF
          </button>
          <button
            onClick={handleSendToClient}
            className="btn btn-primary"
            disabled={selectedPlans.length === 0}
          >
            Enviar a Cliente
          </button>
        </div>
      </div>

      {/* Planes Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const comparison = getPlanComparison(plan.id)
          const isSelected = selectedPlans.includes(plan.id)
          
          return (
            <div
              key={plan.id}
              className={`plan-card plan-${plan.id.toLowerCase()} ${isSelected ? 'selected' : ''}`}
              onClick={() => togglePlanSelection(plan.id)}
            >
              {/* Plan Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePlanSelection(plan.id)}
                    className="h-5 w-5 text-primary-600 rounded"
                  />
                </div>
              </div>

              {/* Precio Inicial */}
              <div className="mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(plan.initial_rent_clp)}
                  </div>
                  <div className="text-sm text-gray-600">Precio inicial mensual</div>
                </div>
              </div>

              {/* Detalles del Plan */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Comisión anual:</span>
                  <span className="font-medium">{plan.commission_percentage}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duración marketing:</span>
                  <span className="font-medium">{plan.marketing_duration_days} días</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nivel de servicio:</span>
                  <span className="font-medium capitalize">{plan.service_level}</span>
                </div>
              </div>

              {/* Cronograma de Ajustes */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-2">Cronograma de Ajustes</h5>
                <div className="space-y-2">
                  {plan.price_adjustment_schedule.map((adjustment, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {adjustment.day === 0 ? 'Inicio' : `Día ${adjustment.day}`}:
                      </span>
                      <span className="font-medium">
                        {adjustment.percentage_reduction === 0 
                          ? formatCurrency(adjustment.new_rent_clp)
                          : `${formatCurrency(adjustment.new_rent_clp)} (-${adjustment.percentage_reduction}%)`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas de Comparación */}
              {comparison && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 block">Tiempo esperado:</span>
                      <span className="font-medium">{comparison.expected_rental_time} días</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 block">Comisión total:</span>
                      <span className="font-medium">{formatCurrency(comparison.total_commission)}</span>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 block">Ingreso neto anual:</span>
                      <span className="font-medium text-success-600">
                        {formatCurrency(comparison.net_annual_income)}
                      </span>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 block">Riesgo vacancia:</span>
                      <span className={`font-medium ${
                        comparison.vacancy_risk_score <= 3 ? 'text-success-600' :
                        comparison.vacancy_risk_score <= 6 ? 'text-warning-600' : 'text-error-600'
                      }`}>
                        {comparison.vacancy_risk_score}/10
                      </span>
                    </div>
                  </div>
                  
                  {/* Recomendación */}
                  <div className="mt-4 text-center">
                    <div className={`font-medium ${getRecommendationColor(comparison.recommendation_score)}`}>
                      {getRecommendationText(comparison.recommendation_score)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Score: {comparison.recommendation_score.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Comparación de Planes */}
      <div className="card">
        <div className="card-header">
          <h4 className="font-medium">Comparación de Planes</h4>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Inicial
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comisión
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso Neto Anual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo Esperado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recomendación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((plan) => {
                  const comparison = getPlanComparison(plan.id)
                  return (
                    <tr key={plan.id} className={selectedPlans.includes(plan.id) ? 'bg-primary-50' : ''}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{plan.name}</div>
                        <div className="text-sm text-gray-500">{plan.service_level}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(plan.initial_rent_clp)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {plan.commission_percentage}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-success-600">
                        {comparison ? formatCurrency(comparison.net_annual_income) : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {comparison ? `${comparison.expected_rental_time} días` : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {comparison && (
                          <div className={`font-medium ${getRecommendationColor(comparison.recommendation_score)}`}>
                            {getRecommendationText(comparison.recommendation_score)}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Información Importante */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="card-body">
          <h4 className="font-medium text-blue-900 mb-3">Información Importante para el Cliente</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• El cliente debe aceptar al menos 1 plan comercial para publicar la propiedad</p>
            <p>• Los ajustes de precio se realizan automáticamente según el cronograma establecido</p>
            <p>• Si no se arrienda en 30 días, se evalúa pasar al plan básico o ajustar propuesta comercial</p>
            <p>• Cada mes de vacancia representa una pérdida del 8.33% de la rentabilidad anual</p>
          </div>
        </div>
      </div>
    </div>
  )
}