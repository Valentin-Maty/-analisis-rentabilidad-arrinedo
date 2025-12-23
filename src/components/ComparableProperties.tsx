'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState, useMemo, useCallback, memo } from 'react'
import type { RentalAnalysisForm } from '@/types/rental'
import { formatNumber, unformatNumber } from '@/utils/numberFormatter'
import { toast } from '@/components/ui/Toast'

interface ComparablePropertiesProps {
  form: UseFormReturn<RentalAnalysisForm>
  formValues: RentalAnalysisForm
  onCalculateSuggestedPrice?: () => void
}

function ComparableProperties({ form, formValues, onCalculateSuggestedPrice }: ComparablePropertiesProps) {
  const { register, setValue } = form
  const [activeComparables, setActiveComparables] = useState<number[]>([1])

  const addComparable = useCallback((index: number) => {
    setActiveComparables(prev => {
      if (!prev.includes(index)) {
        return [...prev, index]
      }
      return prev
    })
  }, [])

  const removeComparable = useCallback((index: number) => {
    setActiveComparables(prev => {
      if (prev.length > 1) {
        // Limpiar los campos del comparable eliminado
        const fields = ['link', 'address', 'm2', 'bedrooms', 'bathrooms', 'parking', 'storage', 'price']
        fields.forEach(field => {
          setValue(`comparable_${index}_${field}` as keyof RentalAnalysisForm, '')
        })
        return prev.filter(i => i !== index)
      }
      return prev
    })
  }, [setValue])

  // Memoizar propiedades de la propiedad principal
  const propertyMetrics = useMemo(() => ({
    m2: parseFloat(formValues.property_size_m2) || 0,
    bedrooms: parseInt(formValues.bedrooms) || 1,
    bathrooms: parseInt(formValues.bathrooms) || 1,
    parking: parseInt(formValues.parking_spaces) || 0
  }), [formValues.property_size_m2, formValues.bedrooms, formValues.bathrooms, formValues.parking_spaces])

  // Memoizar datos válidos de comparables
  const validComparablesData = useMemo(() => {
    return activeComparables.filter(index => {
      const price = formValues[`comparable_${index}_price` as keyof RentalAnalysisForm]
      const m2 = formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm]
      return price && m2 && parseFloat(price) > 0 && parseFloat(m2) > 0
    }).map(index => {
      const price = parseFloat(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '0')
      const m2 = parseFloat(formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] || '0')
      const bedrooms = parseInt(formValues[`comparable_${index}_bedrooms` as keyof RentalAnalysisForm] || '1')
      const bathrooms = parseInt(formValues[`comparable_${index}_bathrooms` as keyof RentalAnalysisForm] || '1')
      const parking = parseInt(formValues[`comparable_${index}_parking` as keyof RentalAnalysisForm] || '0')
      
      // Factor de similitud (0-1)
      const bedroomsSimilarity = 1 - Math.abs(bedrooms - propertyMetrics.bedrooms) * 0.15
      const bathroomsSimilarity = 1 - Math.abs(bathrooms - propertyMetrics.bathrooms) * 0.1
      const parkingSimilarity = parking === propertyMetrics.parking ? 1 : (Math.abs(parking - propertyMetrics.parking) === 1 ? 0.85 : 0.7)
      
      const overallSimilarity = (bedroomsSimilarity + bathroomsSimilarity + parkingSimilarity) / 3
      const pricePerM2 = price / m2
      
      return {
        price,
        m2,
        pricePerM2,
        adjustedPricePerM2: pricePerM2 * overallSimilarity,
        similarity: overallSimilarity,
        bedrooms,
        bathrooms,
        parking,
        index
      }
    })
  }, [activeComparables, formValues, propertyMetrics])

  const calculateSuggestedPrice = useCallback(() => {
    if (validComparablesData.length === 0) {
      toast.warning('Datos incompletos', 'Debe ingresar al menos una propiedad comparable válida (precio y m²)')
      return
    }

    // Cálculos de mercado usando datos memoizados
    const avgPricePerM2 = validComparablesData.reduce((sum, c) => sum + c.pricePerM2, 0) / validComparablesData.length
    const weightedAvgPricePerM2 = validComparablesData.reduce((sum, c) => sum + c.adjustedPricePerM2, 0) / validComparablesData.length
    const maxPricePerM2 = Math.max(...validComparablesData.map(c => c.pricePerM2))
    const minPricePerM2 = Math.min(...validComparablesData.map(c => c.pricePerM2))

    // Precio sugerido considerando similitud
    const suggestedPrice = propertyMetrics.m2 > 0 ? weightedAvgPricePerM2 * propertyMetrics.m2 : weightedAvgPricePerM2 * 50
    
    // Rango de precios
    const minSuggested = minPricePerM2 * propertyMetrics.m2
    const maxSuggested = maxPricePerM2 * propertyMetrics.m2

    setValue('suggested_rent_clp', Math.round(suggestedPrice).toString())
    
    // Mostrar análisis detallado con toast
    toast.success(
      '📊 Análisis Completado',
      `Precio sugerido: $${Math.round(suggestedPrice).toLocaleString('es-CL')} CLP basado en ${validComparablesData.length} comparables`,
      8000
    )
    
    if (onCalculateSuggestedPrice) {
      onCalculateSuggestedPrice()
    }
  }, [validComparablesData, propertyMetrics, setValue, onCalculateSuggestedPrice])

  const renderComparable = useCallback((index: number) => (
    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-sm text-gray-700">
          {index}️⃣ Comparable {index}
        </h4>
        <div className="flex space-x-2">
          {activeComparables.length > 1 && (
            <button
              type="button"
              onClick={() => removeComparable(index)}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              ✕ Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Link y Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            {...register(`comparable_${index}_link` as keyof RentalAnalysisForm)}
            placeholder="Link de publicación (opcional)"
            className="input input-sm text-xs"
          />
          <input
            {...register(`comparable_${index}_address` as keyof RentalAnalysisForm)}
            placeholder="Dirección *"
            className="input input-sm"
          />
        </div>

        {/* M2 y Precio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <input
              {...register(`comparable_${index}_m2` as keyof RentalAnalysisForm)}
              type="number"
              placeholder="Metros cuadrados *"
              className="input input-sm"
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">m²</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Precio arriendo *"
              className="input input-sm"
              value={formatNumber(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '')}
              onChange={(e) => {
                const cleanValue = unformatNumber(e.target.value)
                setValue(`comparable_${index}_price` as keyof RentalAnalysisForm, cleanValue)
              }}
            />
            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">CLP</span>
          </div>
        </div>

        {/* Tipología (se llena automáticamente) */}
        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="text-xs text-gray-600">Dormitorios</label>
            <input
              {...register(`comparable_${index}_bedrooms` as keyof RentalAnalysisForm)}
              type="number"
              min="0"
              defaultValue="1"
              className="input input-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Baños</label>
            <input
              {...register(`comparable_${index}_bathrooms` as keyof RentalAnalysisForm)}
              type="number"
              min="0"
              defaultValue="1"
              className="input input-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Estacionamientos</label>
            <input
              {...register(`comparable_${index}_parking` as keyof RentalAnalysisForm)}
              type="number"
              min="0"
              defaultValue="0"
              className="input input-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Bodegas</label>
            <input
              {...register(`comparable_${index}_storage` as keyof RentalAnalysisForm)}
              type="number"
              min="0"
              defaultValue="0"
              className="input input-sm"
            />
          </div>
        </div>

        {/* Análisis del comparable */}
        {formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] && 
         formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="text-blue-800">
                <span className="font-semibold">💰 Precio/m²:</span> ${Math.round(
                  parseFloat(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '0') / 
                  parseFloat(formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] || '1')
                ).toLocaleString('es-CL')}
              </div>
              <div className="text-purple-700">
                <span className="font-semibold">📈 Total mensual:</span> ${parseFloat(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '0').toLocaleString('es-CL')}
              </div>
            </div>
            
            {/* Análisis de similitud */}
            {formValues.property_size_m2 && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="text-xs text-gray-600">
                  🎯 Estimación para ${formValues.property_size_m2}m²: 
                  <span className="font-bold text-green-700">
                    ${Math.round(
                      (parseFloat(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '0') / 
                       parseFloat(formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] || '1')) * 
                      parseFloat(formValues.property_size_m2)
                    ).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  ), [activeComparables, removeComparable, register, formValues])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="label">🏘️ Propiedades similares:</label>
        <button
          type="button"
          onClick={calculateSuggestedPrice}
          className="btn btn-secondary text-xs"
        >
          🔮 Calcular Precio Sugerido
        </button>
      </div>

      {/* Comparables activos */}
      <div className="space-y-4">
        {activeComparables.map(index => renderComparable(index))}
      </div>

      {/* Botones para agregar comparables */}
      <div className="flex space-x-2">
        {!activeComparables.includes(2) && (
          <button
            type="button"
            onClick={() => addComparable(2)}
            className="btn btn-outline text-xs"
          >
            ➕ Agregar Comparable 2
          </button>
        )}
        {!activeComparables.includes(3) && activeComparables.includes(2) && (
          <button
            type="button"
            onClick={() => addComparable(3)}
            className="btn btn-outline text-xs"
          >
            ➕ Agregar Comparable 3
          </button>
        )}
      </div>

      {/* Análisis de mercado en tiempo real */}
      {activeComparables.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
          <h4 className="font-bold text-green-800 mb-3 flex items-center">
            📊 Análisis de Mercado en Tiempo Real
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {(() => {
              const validPrices = activeComparables
                .filter(index => {
                  const price = formValues[`comparable_${index}_price` as keyof RentalAnalysisForm]
                  const m2 = formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm]
                  return price && m2 && parseFloat(price) > 0 && parseFloat(m2) > 0
                })
                .map(index => {
                  const price = parseFloat(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '0')
                  const m2 = parseFloat(formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] || '1')
                  return price / m2
                })

              if (validPrices.length === 0) {
                return (
                  <div className="col-span-full text-center text-gray-500">
                    📝 Complete los comparables para ver el análisis de mercado
                  </div>
                )
              }

              const avgPrice = validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
              const maxPrice = Math.max(...validPrices)
              const minPrice = Math.min(...validPrices)
              const propertyM2 = parseFloat(formValues.property_size_m2) || 0

              return (
                <>
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="text-green-700 font-semibold">🎯 Promedio Mercado</div>
                    <div className="text-lg font-bold text-green-800">${Math.round(avgPrice).toLocaleString('es-CL')}/m²</div>
                    {propertyM2 > 0 && (
                      <div className="text-xs text-green-600">Para {propertyM2}m²: ${Math.round(avgPrice * propertyM2).toLocaleString('es-CL')}</div>
                    )}
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-blue-300">
                    <div className="text-blue-700 font-semibold">📈 Rango de Precios</div>
                    <div className="text-sm font-bold text-blue-800">
                      ${Math.round(minPrice).toLocaleString('es-CL')} - ${Math.round(maxPrice).toLocaleString('es-CL')}/m²
                    </div>
                    {propertyM2 > 0 && (
                      <div className="text-xs text-blue-600">
                        ${Math.round(minPrice * propertyM2).toLocaleString('es-CL')} - ${Math.round(maxPrice * propertyM2).toLocaleString('es-CL')}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-300">
                    <div className="text-purple-700 font-semibold">🔍 Comparables</div>
                    <div className="text-lg font-bold text-purple-800">{validPrices.length} activos</div>
                    <div className="text-xs text-purple-600">
                      Desviación: ±${Math.round((maxPrice - minPrice) / 2).toLocaleString('es-CL')}/m²
                    </div>
                  </div>
                </>
              )
            })()} 
          </div>

          <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
            <strong>💡 Consejos:</strong> Use al menos 2 comparables para un análisis confiable. 
            El sistema ajusta automáticamente por similitud en dormitorios, baños y estacionamientos.
          </div>
        </div>
      )}
      
      {/* Información de uso */}
      <div className="bg-gray-50 p-3 rounded border">
        <p className="text-xs text-gray-600">
          <strong>💡 Cómo usar:</strong> Agregue propiedades similares de la zona. 
          El algoritmo considera ubicación, tamaño y características para calcular el precio óptimo con análisis de mercado avanzado.
        </p>
      </div>
    </div>
  )
}

// Memoizar el componente para evitar re-renders innecesarios cuando las props no cambian
export default memo(ComparableProperties)