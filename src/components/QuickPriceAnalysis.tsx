'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnalysisStorage } from '@/lib/localStorage'
import { SavedAnalysis } from '@/types/saved-analysis'
import { toast } from '@/components/ui/Toast'
import { formatNumber, unformatNumber } from '@/utils/numberFormatter'

interface ComparableProperty {
  id: number
  link: string
  address: string
  m2: string
  bedrooms: string
  bathrooms: string
  parking: string
  storage: string
  price: string
}

export default function QuickPriceAnalysis() {
  const router = useRouter()
  const [comparables, setComparables] = useState<ComparableProperty[]>([
    { id: 1, link: '', address: '', m2: '', bedrooms: '1', bathrooms: '1', parking: '0', storage: '0', price: '' }
  ])
  
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null)
  const [initialPrice, setInitialPrice] = useState('')
  const [propertyM2, setPropertyM2] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')

  const updateComparable = (id: number, field: keyof ComparableProperty, value: string) => {
    setComparables(prev => prev.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ))
  }

  const calculateSuggestedPrice = () => {
    const validComparables = comparables.filter(c => c.price && c.m2)
    if (validComparables.length === 0) return

    const prices = validComparables.map(c => {
      const price = parseFloat(c.price)
      const m2 = parseFloat(c.m2)
      return { price, pricePerM2: price / m2 }
    })

    const avgPricePerM2 = prices.reduce((acc, p) => acc + p.pricePerM2, 0) / prices.length
    
    // Si hay metros cuadrados de la propiedad, usar precio por m²
    const targetM2 = parseFloat(propertyM2) || 0
    const suggestedPrice = targetM2 > 0 
      ? avgPricePerM2 * targetM2
      : prices.reduce((acc, p) => acc + p.price, 0) / prices.length
    
    setSuggestedPrice(Math.round(suggestedPrice))
  }

  const removeComparable = (id: number) => {
    if (comparables.length > 1) {
      setComparables(prev => prev.filter(comp => comp.id !== id))
    }
  }

  // Función para guardar el análisis rápido
  const handleSaveQuickAnalysis = () => {
    if (!suggestedPrice || suggestedPrice <= 0) {
      toast.error('Error', 'Primero debes calcular un precio sugerido')
      return
    }

    const analysisData: SavedAnalysis = {
      id: AnalysisStorage.generateId(),
      title: propertyAddress || `Análisis Rápido - ${new Date().toLocaleDateString('es-CL')}`,
      property: {
        address: propertyAddress || 'Dirección no especificada',
        value_clp: 0, // No calculamos valor en análisis rápido
        size_m2: parseFloat(propertyM2) || 0,
        bedrooms: 0, // Promedio de comparables
        bathrooms: 0,
        parking_spaces: 0,
        storage_units: 0
      },
      analysis: {
        suggested_rent_clp: Math.round(suggestedPrice),
        rent_currency: 'CLP',
        comparable_properties: comparables.filter(c => c.price && c.m2).map((c, idx) => ({
          id: `comp_${idx}`,
          address: c.address,
          link: c.link,
          rent_clp: parseFloat(c.price),
          size_m2: parseFloat(c.m2),
          similarity_score: 85, // Score aproximado
          bedrooms: parseInt(c.bedrooms) || 0,
          bathrooms: parseInt(c.bathrooms) || 0,
          parking_spaces: parseInt(c.parking) || 0
        })),
        annual_expenses: {
          maintenance_clp: 0,
          property_tax_clp: 0,
          insurance_clp: 0
        },
        uf_value_clp: 38000 // Valor UF aproximado
      },
      calculations: {
        cap_rate: 0,
        annual_rental_yield: 0,
        monthly_net_income: Math.round(suggestedPrice * 0.9), // Aproximado
        vacancy_cost_per_month: 0,
        break_even_rent_reduction: 0,
        plan_comparisons: []
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        broker_email: 'usuario@ejemplo.com',
        status: 'draft',
        tags: ['análisis-rápido', 'precio-sugerido'],
        notes: `Precio calculado basado en ${comparables.filter(c => c.price && c.m2).length} comparables`
      }
    }

    const success = AnalysisStorage.save(analysisData)
    
    if (success) {
      toast.success('¡Éxito!', 'Análisis guardado correctamente')
      setTimeout(() => {
        router.push('/analyses')
      }, 1500)
    } else {
      toast.error('Error', 'No se pudo guardar el análisis')
    }
  }

  // Función para ir al análisis completo
  const handleGoToFullAnalysis = () => {
    // Guardar datos temporales en sessionStorage para prellenar el formulario
    const tempData = {
      suggestedPrice: Math.round(suggestedPrice || 0),
      propertyAddress,
      propertyM2,
      comparables: comparables.filter(c => c.price && c.m2)
    }
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quickAnalysisData', JSON.stringify(tempData))
    }
    
    // Navegar a la página de análisis completo (PropertyFormImproved)
    router.push('/new-analysis')
  }

  const addComparable = () => {
    const newId = Math.max(...comparables.map(c => c.id)) + 1
    setComparables(prev => [...prev, {
      id: newId,
      link: '',
      address: '',
      m2: '',
      bedrooms: '1',
      bathrooms: '1',
      parking: '0',
      storage: '0',
      price: ''
    }])
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header mejorado */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🏠 Calculadora de Precio de Arriendo</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Obtén una referencia de precio para tu propiedad comparándola con arriendos similares del mercado
        </p>
      </div>

      {/* Pasos del proceso */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="text-3xl mb-3 text-center">1️⃣</div>
          <h3 className="font-bold text-blue-900 text-center mb-2">Ingresa los datos</h3>
          <p className="text-sm text-blue-700 text-center">
            Añade información de propiedades similares que estén en arriendo
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <div className="text-3xl mb-3 text-center">2️⃣</div>
          <h3 className="font-bold text-green-900 text-center mb-2">Calcula el precio</h3>
          <p className="text-sm text-green-700 text-center">
            Nuestro algoritmo analiza los comparables y sugiere un precio
          </p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="text-3xl mb-3 text-center">3️⃣</div>
          <h3 className="font-bold text-purple-900 text-center mb-2">Obtén resultados</h3>
          <p className="text-sm text-purple-700 text-center">
            Recibe una estimación profesional basada en datos reales del mercado
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-2">📊 Análisis Comparativo</h2>
          <p className="text-gray-600 mb-6">
            Compara tu propiedad con arriendos similares para obtener una referencia de precio precisa
          </p>

          {/* Información de la propiedad objetivo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-3">🏠 Propiedad a Analizar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={propertyM2}
                onChange={(e) => setPropertyM2(e.target.value)}
                type="number"
                placeholder="Metros cuadrados de la propiedad"
                className="input input-sm"
              />
              <div className="text-sm text-blue-700 flex items-center">
                💡 Opcional: Para cálculo más preciso por m²
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {comparables.map((comp, index) => (
              <div key={comp.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm">
                    {index + 1}️⃣ Propiedad Comparable {index + 1}
                  </h4>
                  {comparables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeComparable(comp.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕ Eliminar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={comp.link}
                    onChange={(e) => updateComparable(comp.id, 'link', e.target.value)}
                    placeholder="Link de publicación (opcional)"
                    className="input input-sm"
                  />
                  <input
                    value={comp.address}
                    onChange={(e) => updateComparable(comp.id, 'address', e.target.value)}
                    placeholder="Dirección"
                    className="input input-sm"
                  />
                  <input
                    value={comp.m2}
                    onChange={(e) => updateComparable(comp.id, 'm2', e.target.value)}
                    type="number"
                    placeholder="Metros cuadrados"
                    className="input input-sm"
                  />
                  <input
                    value={formatNumber(comp.price)}
                    onChange={(e) => {
                      const cleanValue = unformatNumber(e.target.value)
                      updateComparable(comp.id, 'price', cleanValue)
                    }}
                    type="text"
                    placeholder="Precio arriendo CLP"
                    className="input input-sm"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  <input
                    value={comp.bedrooms}
                    onChange={(e) => updateComparable(comp.id, 'bedrooms', e.target.value)}
                    type="number"
                    min="0"
                    placeholder="Dormitorios"
                    className="input input-sm"
                  />
                  <input
                    value={comp.bathrooms}
                    onChange={(e) => updateComparable(comp.id, 'bathrooms', e.target.value)}
                    type="number"
                    min="0"
                    placeholder="Baños"
                    className="input input-sm"
                  />
                  <input
                    value={comp.parking}
                    onChange={(e) => updateComparable(comp.id, 'parking', e.target.value)}
                    type="number"
                    min="0"
                    placeholder="Estacionamientos"
                    className="input input-sm"
                  />
                  <input
                    value={comp.storage}
                    onChange={(e) => updateComparable(comp.id, 'storage', e.target.value)}
                    type="number"
                    min="0"
                    placeholder="Bodegas"
                    className="input input-sm"
                  />
                </div>

                {comp.price && comp.m2 && (
                  <div className="mt-2 text-sm text-gray-600">
                    💰 Precio por m²: ${Math.round(parseFloat(comp.price) / parseFloat(comp.m2)).toLocaleString('es-CL')} CLP/m²
                  </div>
                )}
              </div>
            ))}

            {comparables.length < 4 && (
              <button
                type="button"
                onClick={addComparable}
                className="btn btn-secondary w-full"
              >
                ➕ Agregar Comparable ({comparables.length + 1}/4)
              </button>
            )}

            <div className="border-t-2 pt-4">
              <button
                type="button"
                onClick={calculateSuggestedPrice}
                className="btn btn-primary w-full mb-4"
              >
                🔮 Calcular Precio Sugerido
              </button>

              {suggestedPrice && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-bold text-green-800 mb-2">💡 Precio Sugerido</h3>
                  <p className="text-2xl font-bold text-green-700">
                    ${suggestedPrice.toLocaleString('es-CL')} CLP/mes
                  </p>
                </div>
              )}

              <div className="mt-4">
                <label className="label">📍 Dirección de tu propiedad (opcional)</label>
                <input
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  type="text"
                  placeholder="Ej: Av. Providencia 1234, Las Condes"
                  className="input mb-4"
                />

                <label className="label">📝 Precio Inicial (desde orden de captación)</label>
                <input
                  value={formatNumber(initialPrice)}
                  onChange={(e) => {
                    const cleanValue = unformatNumber(e.target.value)
                    setInitialPrice(cleanValue)
                  }}
                  type="text"
                  placeholder="Precio ya acordado con el cliente (opcional)"
                  className="input"
                />
                {initialPrice && (
                  <div className="mt-2 bg-green-50 p-3 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      ✅ Este precio se usará como base para los planes comerciales A, B y C
                    </p>
                  </div>
                )}
              </div>

              {/* Información mejorada sobre el uso */}
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-3">💡 ¿Cómo funciona?</h4>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">🔍</span>
                      <span><strong>Busca propiedades similares</strong> en portales inmobiliarios</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">📝</span>
                      <span><strong>Ingresa los datos</strong> de ubicación, tamaño y precio</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🧮</span>
                      <span><strong>Calculamos automáticamente</strong> el precio promedio por m²</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🎯</span>
                      <span><strong>Obtienes una referencia</strong> precisa para tu propiedad</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-3">✅ Consejos profesionales</h4>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">🏠</span>
                      <span><strong>Busca propiedades</strong> en el mismo sector o similares</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">📏</span>
                      <span><strong>Prioriza tamaños</strong> y características parecidas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🔢</span>
                      <span><strong>3-4 comparables</strong> son suficientes para una buena estimación</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">📊</span>
                      <span><strong>Los resultados</strong> son una referencia, no una garantía</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Acciones disponibles después del cálculo */}
              {suggestedPrice && suggestedPrice > 0 && (
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🎯 ¿Qué deseas hacer ahora?
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Botón para guardar análisis rápido */}
                    <button
                      onClick={() => handleSaveQuickAnalysis()}
                      className="btn btn-primary flex items-center justify-center space-x-2 py-4"
                    >
                      <span>💾</span>
                      <span>Guardar este Análisis Rápido</span>
                    </button>

                    {/* Botón para ir al análisis completo */}
                    <button
                      onClick={() => handleGoToFullAnalysis()}
                      className="btn btn-secondary flex items-center justify-center space-x-2 py-4"
                    >
                      <span>📊</span>
                      <span>Crear Análisis Completo</span>
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> El análisis completo incluye planes comerciales,
                      cálculo de rentabilidad, comparación de escenarios y generación de PDF profesional.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}