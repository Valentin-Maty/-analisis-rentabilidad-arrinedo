'use client'

import { useState } from 'react'
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
  const [comparables, setComparables] = useState<ComparableProperty[]>([
    { id: 1, link: '', address: '', m2: '', bedrooms: '1', bathrooms: '1', parking: '0', storage: '0', price: '' }
  ])
  
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null)
  const [initialPrice, setInitialPrice] = useState('')
  const [propertyM2, setPropertyM2] = useState('')

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
    <div className="max-w-4xl mx-auto p-6">
      <div className="card">
        <div className="card-body">
          <h2 className="text-2xl font-bold mb-2">🔍 Análisis Rápido de Precio</h2>
          <p className="text-gray-600 mb-6">
            Pre-análisis para entregar referencia de precio al cliente usando propiedades comparables
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
                    💰 Precio por m²: ${Math.round(parseFloat(comp.price) / parseFloat(comp.m2)).toLocaleString()} CLP/m²
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
                    ${suggestedPrice.toLocaleString()} CLP/mes
                  </p>
                </div>
              )}

              <div className="mt-4">
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

              {/* Información sobre el uso */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-yellow-800 mb-2">📋 Sobre esta herramienta</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Análisis rápido:</strong> Para dar referencia usando propiedades similares</li>
                  <li>• <strong>3-4 comparables máximo:</strong> Enfoque en calidad vs cantidad</li>
                  <li>• <strong>Independiente:</strong> Se puede usar sin generar planes comerciales</li>
                  <li>• <strong>Para corredores:</strong> Ideal antes de visitar la propiedad</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}