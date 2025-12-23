'use client'

import { useState } from 'react'
import type { RentalPlan, RentalAnalysis, PlanComparison } from '@/types/rental'
import { generateSimpleRentalPDF } from '@/utils/simplePdfGenerator'

interface RentalPlansImprovedProps {
  plans: RentalPlan[]
  planComparisons: PlanComparison[]
  analysis: RentalAnalysis
  rentCurrency?: 'CLP' | 'UF'
  rentValueUF?: number
}

export default function RentalPlansImproved({ plans, planComparisons, analysis, rentCurrency = 'CLP', rentValueUF }: RentalPlansImprovedProps) {
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [clientLink, setClientLink] = useState('')
  
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
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getRecommendationText = (score: number) => {
    if (score >= 8) return 'Altamente Recomendado'
    if (score >= 6) return 'Recomendado'
    return 'No Recomendado'
  }

  const handleGeneratePDF = async () => {
    if (selectedPlans.length === 0) {
      alert('⚠️ Debe seleccionar al menos un plan para generar el PDF')
      return
    }

    setIsGeneratingPDF(true)
    try {
      await generateSimpleRentalPDF({
        analysis,
        selectedPlanIds: selectedPlans,
        planComparisons,
        rentCurrency,
        rentValueUF,
        brokerInfo: {
          name: 'Juan Pérez', // En producción vendría del usuario logueado
          email: 'juan.perez@tumatch.cl',
          phone: '+56 9 1234 5678'
        }
      })
      
      // Simular tiempo de generación
      setTimeout(() => {
        setIsGeneratingPDF(false)
        alert('✅ PDF generado exitosamente y descargado')
      }, 2000)
      
    } catch (error) {
      setIsGeneratingPDF(false)
      console.error('Error generando PDF:', error)
      alert('❌ Error al generar el PDF: ' + (error as Error).message)
    }
  }

  const handleSendToClient = async () => {
    if (selectedPlans.length === 0) {
      alert('⚠️ Debe seleccionar al menos un plan para enviar al cliente')
      return
    }

    setIsSendingEmail(true)

    try {
      // Simular tiempo de envío
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generar token único y URL para el cliente
      const token = 'demo-' + Math.random().toString(36).substr(2, 9)
      const clientUrl = `${window.location.origin}/cliente/${token}`
      
      setClientLink(clientUrl)
      setIsSendingEmail(false)
      setShowSuccessModal(true)

    } catch (error) {
      setIsSendingEmail(false)
      alert('❌ Error al enviar propuesta: ' + (error as Error).message)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(clientLink)
      alert('✅ Enlace copiado al portapapeles')
    } catch (err) {
      alert('❌ Error al copiar enlace')
    }
  }

  const handleEmailClient = () => {
    const emailSubject = `Propuesta de Arriendo - ${analysis.property.address}`
    const emailBody = `
Estimado cliente,

Le enviamos la propuesta de arriendo para su propiedad ubicada en ${analysis.property.address}.

Por favor revise los planes seleccionados y confirme su aceptación a través del siguiente enlace:
${clientLink}

Planes incluidos: ${selectedPlans.join(', ')}

Características del análisis:
• CAP Rate: ${analysis.cap_rate_analysis.cap_rate_percentage.toFixed(2)}%
• Precio inicial sugerido: ${formatCurrency(analysis.recommended_initial_rent)}
• Análisis válido por 30 días

Saludos cordiales,
TuMatch Arriendos
    `.trim()
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.open(mailtoLink)
    setShowSuccessModal(false)
  }

  return (
    <div className="space-y-8">
      {/* Header de Planes */}
      <div className="text-center">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Planes Comerciales A, B y C
        </h3>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Estos son 3 planes diferentes para arrendar su propiedad. Cada uno bajará el precio de forma distinta para arrendar más rápido.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-3xl mx-auto">
          <div className="flex items-start space-x-3">
            <span className="text-blue-600 text-xl">💡</span>
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">¿Cómo funcionan los planes?</div>
              <div>• <strong>Plan A:</strong> Baja el precio rápido para arrendar en pocos días</div>
              <div>• <strong>Plan B:</strong> Equilibrio entre precio y tiempo</div>
              <div>• <strong>Plan C:</strong> Mantiene el precio alto más tiempo</div>
              <div className="mt-2 text-blue-700 font-medium">✅ Usted elige cuál(es) presentar al dueño</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contador y acciones */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white rounded-2xl p-6 shadow-lg border">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full font-bold">
            {selectedPlans.length} plan{selectedPlans.length !== 1 ? 'es' : ''} seleccionado{selectedPlans.length !== 1 ? 's' : ''}
          </div>
          {selectedPlans.length > 0 && (
            <div className="text-sm text-gray-600">
              Planes: {selectedPlans.join(', ')}
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleGeneratePDF}
            disabled={selectedPlans.length === 0 || isGeneratingPDF}
            className={`btn ${isGeneratingPDF ? 'opacity-50' : 'btn-secondary'}`}
          >
            {isGeneratingPDF ? '⏳ Generando PDF...' : '📄 Generar PDF'}
          </button>
          <button
            onClick={handleSendToClient}
            disabled={selectedPlans.length === 0 || isSendingEmail}
            className={`btn ${isSendingEmail ? 'opacity-50' : 'btn-primary'}`}
          >
            {isSendingEmail ? '⏳ Enviando...' : '📧 Enviar a Cliente'}
          </button>
        </div>
      </div>

      {/* Grid de Planes */}
      <div className="grid lg:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const comparison = getPlanComparison(plan.id)
          const isSelected = selectedPlans.includes(plan.id)
          
          return (
            <div
              key={plan.id}
              className={`plan-card plan-${plan.id.toLowerCase()} ${isSelected ? 'selected' : ''}`}
              onClick={() => togglePlanSelection(plan.id)}
            >
              {/* Header del Plan */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-3xl">
                      {plan.id === 'A' ? '🥇' : plan.id === 'B' ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900">{plan.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{plan.service_level}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{plan.description}</p>
                  
                  {comparison && (
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(comparison.recommendation_score)}`}>
                      {getRecommendationText(comparison.recommendation_score)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => togglePlanSelection(plan.id)}
                    className="h-6 w-6 text-purple-600 rounded-lg"
                  />
                </div>
              </div>

              {/* Precio Principal */}
              <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatCurrency(plan.initial_rent_clp)}
                </div>
                <div className="text-sm text-gray-600">Precio inicial mensual</div>
              </div>

              {/* Detalles del Plan */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">💰 Comisión anual:</span>
                  <span className="font-bold text-lg">{plan.commission_percentage}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">⏰ Marketing:</span>
                  <span className="font-medium">{plan.marketing_duration_days} días</span>
                </div>
                
                {comparison && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">📅 Tiempo esperado:</span>
                    <span className="font-medium text-green-600">{comparison.expected_rental_time} días</span>
                  </div>
                )}
              </div>

              {/* Cronograma de Ajustes */}
              <div className="mb-6">
                <h5 className="font-bold text-gray-900 mb-3 flex items-center">
                  📊 Cronograma de Precios
                </h5>
                <div className="space-y-2">
                  {plan.price_adjustment_schedule.map((adjustment, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <span className="font-medium text-gray-700">
                        {adjustment.day === 0 ? '🚀 Inicio' : `📅 Día ${adjustment.day}`}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatCurrency(adjustment.new_rent_clp)}
                        </div>
                        {adjustment.percentage_reduction > 0 && (
                          <div className="text-xs text-red-600">
                            -{adjustment.percentage_reduction}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas de Proyección */}
              {comparison && (
                <div className="border-t pt-4">
                  <h5 className="font-bold text-gray-900 mb-3">📈 Proyecciones</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-800">
                        {formatCurrency(comparison.net_annual_income)}
                      </div>
                      <div className="text-xs text-green-600">Dinero real que ganará en un año</div>
                    </div>
                    
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-800">
                        {comparison.vacancy_risk_score}/10
                      </div>
                      <div className="text-xs text-blue-600">Qué tan difícil será encontrar arrendatario</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tabla de Comparación */}
      <div className="card">
        <div className="card-header">
          <h4 className="text-xl font-bold text-white">📊 Comparación Detallada de Planes</h4>
        </div>
        <div className="card-body overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Precio Inicial</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Comisión</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Dinero Real del Año</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tiempo Esperado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Recomendación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plans.map((plan) => {
                const comparison = getPlanComparison(plan.id)
                const isSelected = selectedPlans.includes(plan.id)
                
                return (
                  <tr key={plan.id} className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {plan.id === 'A' ? '🥇' : plan.id === 'B' ? '🥈' : '🥉'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{plan.name}</div>
                          <div className="text-sm text-gray-600 capitalize">{plan.service_level}</div>
                        </div>
                        {isSelected && (
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                            ✓ Seleccionado
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-lg">
                      {formatCurrency(plan.initial_rent_clp)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {plan.commission_percentage}%
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      {comparison ? formatCurrency(comparison.net_annual_income) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {comparison ? `${comparison.expected_rental_time} días` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {comparison && (
                        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(comparison.recommendation_score)}`}>
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

      {/* Información Importante */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">💡</span>
          Información Importante que Debe Saber el Dueño
        </h4>
        <div className="grid lg:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <p>• El dueño debe aceptar al menos 1 plan para empezar a publicar</p>
            <p>• Los descuentos se hacen automáticamente en las fechas programadas</p>
            <p>• Si no se arrienda en 30 días, revisamos y ajustamos la estrategia</p>
          </div>
          <div className="space-y-2">
            <p>• Cada mes vacía es dinero perdido que nunca se puede recuperar</p>
            <p>• Si no acepta ningún plan, debe avisar inmediatamente a su jefe</p>
            <p>• Esta propuesta tiene validez por sólo 30 días</p>
          </div>
        </div>
      </div>

      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">¡Propuesta Enviada!</h3>
              <p className="text-gray-600 mb-6">
                Se ha generado el enlace para que el cliente revise y acepte los planes seleccionados.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Enlace para el cliente:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={clientLink}
                    readOnly
                    className="flex-1 text-sm bg-white border rounded px-3 py-2"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-secondary text-sm py-2"
                  >
                    📋 Copiar
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleEmailClient}
                  className="flex-1 btn btn-primary"
                >
                  📧 Abrir Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}