'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import type { RentalAnalysis, ClientResponse } from '@/types/rental'

// Simulamos datos del análisis (en producción vendría de una API)
const mockAnalysis: RentalAnalysis = {
  property: {
    id: 'prop-123',
    address: 'Av. Providencia 1234, Las Condes',
    value_clp: 95000000,
    value_uf: 2500,
    market_rent_clp: 850000,
    size_m2: 85,
    bedrooms: 2,
    bathrooms: 2,
    parking_spaces: 1,
    storage_units: 1
  },
  plans: [
    {
      id: 'A',
      name: 'Plan Premium',
      description: 'Servicio completo con marketing intensivo y ajustes flexibles',
      initial_rent_clp: 850000,
      commission_percentage: 12,
      marketing_duration_days: 30,
      service_level: 'premium',
      price_adjustment_schedule: [
        { day: 0, new_rent_clp: 850000, percentage_reduction: 0 },
        { day: 15, new_rent_clp: 807500, percentage_reduction: 5 },
        { day: 25, new_rent_clp: 782000, percentage_reduction: 8 },
        { day: 30, new_rent_clp: 765000, percentage_reduction: 10 }
      ]
    },
    {
      id: 'B',
      name: 'Plan Estándar',
      description: 'Balance entre precio y servicio con ajustes moderados',
      initial_rent_clp: 850000,
      commission_percentage: 10,
      service_level: 'standard',
      marketing_duration_days: 30,
      price_adjustment_schedule: [
        { day: 0, new_rent_clp: 850000, percentage_reduction: 0 },
        { day: 20, new_rent_clp: 790500, percentage_reduction: 7 },
        { day: 30, new_rent_clp: 748000, percentage_reduction: 12 }
      ]
    },
    {
      id: 'C',
      name: 'Plan Básico',
      description: 'Menor comisión con precio fijo durante todo el período',
      initial_rent_clp: 850000,
      commission_percentage: 8,
      service_level: 'basic',
      marketing_duration_days: 30,
      price_adjustment_schedule: [
        { day: 0, new_rent_clp: 850000, percentage_reduction: 0 },
        { day: 30, new_rent_clp: 722500, percentage_reduction: 15 }
      ]
    }
  ],
  market_study: {
    comparable_properties: [],
    average_rent_per_m2: 10000,
    market_range: {
      min_rent_clp: 750000,
      max_rent_clp: 950000
    },
    neighborhood_factors: {
      location_score: 8,
      transportation_access: 7,
      amenities_score: 6
    }
  },
  cap_rate_analysis: {
    property_value_clp: 95000000,
    annual_rental_income: 10200000,
    annual_expenses: 1000000,
    net_operating_income: 9200000,
    cap_rate_percentage: 9.68,
    comparison_to_market: 'above'
  },
  vacancy_impact: {
    days_vacant: 30,
    percentage_annual_loss: 8.33,
    lost_income_clp: 850000,
    break_even_reduction_percentage: 9.09
  },
  recommended_initial_rent: 850000
}

export default function ClientReviewPage() {
  const params = useParams()
  const token = params?.token as string
  
  const [analysis, setAnalysis] = useState<RentalAnalysis | null>(null)
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // En producción, aquí haría una llamada a la API para obtener el análisis usando el token
    // Por ahora simulamos la carga
    setTimeout(() => {
      setAnalysis(mockAnalysis)
      setLoading(false)
    }, 1000)
  }, [token])

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

  const handleSubmitResponse = async () => {
    if (selectedPlans.length === 0) {
      alert('Debe seleccionar al menos un plan para continuar')
      return
    }

    // En producción, aquí enviaría la respuesta a la API
    const response: ClientResponse = {
      plan_ids_accepted: selectedPlans as Array<'A' | 'B' | 'C'>,
      response_date: new Date(),
      client_email: clientInfo.email,
      broker_email: 'broker@tumatch.cl', // Vendría del análisis
      notes: clientInfo.notes
    }

    console.log('Respuesta del cliente:', response)
    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Análisis no encontrado</h2>
          <p className="text-gray-600">El enlace puede haber expirado o ser inválido.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Respuesta Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido su respuesta. Su corredor será notificado inmediatamente y se pondrá en contacto con usted para los siguientes pasos.
          </p>
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-sm text-primary-700">
              <strong>Planes seleccionados:</strong> {selectedPlans.join(', ')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Propuesta de Arriendo</h1>
            <p className="text-gray-600 mt-2">Revise y seleccione los planes que desea aprobar</p>
            <p className="text-sm text-gray-500 mt-1">Análisis para: {analysis.property.address}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Resumen de la Propiedad */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Resumen de su Propiedad</h2>
          </div>
          <div className="card-body">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Dirección:</span>
                  <span className="ml-2 font-medium">{analysis.property.address}</span>
                </div>
                <div>
                  <span className="text-gray-600">Superficie:</span>
                  <span className="ml-2 font-medium">{analysis.property.size_m2} m²</span>
                </div>
                <div>
                  <span className="text-gray-600">Dormitorios:</span>
                  <span className="ml-2 font-medium">{analysis.property.bedrooms}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Valor de la propiedad:</span>
                  <span className="ml-2 font-medium">
                    {analysis.property.value_uf 
                      ? `${analysis.property.value_uf.toLocaleString()} UF` 
                      : formatCurrency(analysis.property.value_clp)
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">CAP Rate estimado:</span>
                  <span className="ml-2 font-medium text-success-600">
                    {analysis.cap_rate_analysis.cap_rate_percentage.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Precio inicial sugerido:</span>
                  <span className="ml-2 font-medium text-primary-600">
                    {formatCurrency(analysis.recommended_initial_rent)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Vacancia */}
        <div className="card bg-warning-50 border-warning-200">
          <div className="card-header">
            <h3 className="font-medium text-warning-900">⚠️ Información Importante sobre Vacancia</h3>
          </div>
          <div className="card-body text-warning-800">
            <p className="mb-2">
              <strong>Costo de vacancia:</strong> Cada mes que su propiedad esté vacante representa una pérdida del <strong>8.33%</strong> de su rentabilidad anual.
            </p>
            <p>
              Es por esto que ofrecemos diferentes planes con ajustes de precio para minimizar el tiempo de vacancia y maximizar sus ingresos.
            </p>
          </div>
        </div>

        {/* Planes Disponibles */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Planes Disponibles</h2>
          <p className="text-gray-600">Seleccione uno o más planes que desea aprobar. Necesita aprobar al menos un plan para continuar.</p>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {analysis.plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card plan-${plan.id.toLowerCase()} ${selectedPlans.includes(plan.id) ? 'selected' : ''}`}
                onClick={() => togglePlanSelection(plan.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes(plan.id)}
                    onChange={() => togglePlanSelection(plan.id)}
                    className="h-5 w-5 text-primary-600 rounded"
                  />
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatCurrency(plan.initial_rent_clp)}
                  </div>
                  <div className="text-sm text-gray-600">Precio inicial mensual</div>
                </div>

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

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Cronograma de Ajustes</h4>
                  <div className="space-y-1">
                    {plan.price_adjustment_schedule.map((adjustment, index) => (
                      <div key={index} className="flex justify-between text-xs">
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
              </div>
            ))}
          </div>
        </div>

        {/* Términos y Condiciones */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="mr-2">📋</span>
              Términos y Condiciones de Aceptación
            </h3>
          </div>
          <div className="card-body space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-3">Al aceptar este plan comercial, usted acepta lo siguiente:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>La propiedad será publicada en exclusiva bajo el plan seleccionado por un período de <strong>30 días</strong>.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Los ajustes de precio se realizarán automáticamente según el cronograma establecido.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Después de 30 días, la propiedad pasará automáticamente al plan básico, salvo manifestación contraria.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>La fecha de inicio de publicación será <strong>{new Date(Date.now() + 24*60*60*1000).toLocaleDateString('es-CL')}</strong> (24 horas después de su confirmación).</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre completo *</label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  className="input"
                  placeholder="Juan Pérez González"
                  required
                />
              </div>
              <div>
                <label className="label">Email de confirmación *</label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                  className="input"
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Teléfono de contacto *</label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                  className="input"
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>
              <div>
                <label className="label">Fecha de la propuesta</label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString('es-CL')}
                  readOnly
                  className="input bg-gray-100"
                />
              </div>
            </div>
            
            <div>
              <label className="label">Comentarios adicionales (opcional)</label>
              <textarea
                value={clientInfo.notes}
                onChange={(e) => setClientInfo({...clientInfo, notes: e.target.value})}
                className="input resize-none"
                rows={3}
                placeholder="Cualquier comentario, preferencia de horarios, o consulta adicional sobre el servicio..."
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="termsAccepted" className="text-sm text-green-800">
                  <strong>Confirmo que:</strong> He leído y acepto los términos y condiciones de exclusividad. 
                  Autorizo el inicio de la publicación de mi propiedad bajo el(los) plan(es) seleccionado(s) 
                  y entiendo las condiciones de ajuste de precios establecidas.
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleSubmitResponse}
            disabled={selectedPlans.length === 0 || !clientInfo.name || !clientInfo.email || !clientInfo.phone || !termsAccepted}
            className="btn btn-success px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar Respuesta ({selectedPlans.length} plan{selectedPlans.length !== 1 ? 'es' : ''} seleccionado{selectedPlans.length !== 1 ? 's' : ''})
          </button>
        </div>

        {/* Footer informativo */}
        <div className="card bg-gray-50">
          <div className="card-body text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>¿Qué pasa después de enviar su respuesta?</strong>
            </p>
            <div className="space-y-1">
              <p>• Su corredor será notificado inmediatamente de su decisión</p>
              <p>• Si acepta algún plan, procederemos a publicar su propiedad</p>
              <p>• Si no acepta ningún plan, su caso será escalado a gerencia para evaluación</p>
              <p>• Este análisis es válido por 30 días desde su creación</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}