'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import type { RentalAnalysisForm } from '@/types/rental'
import { formatNumber, unformatNumber } from '@/utils/numberFormatter'

interface ComparablePropertiesProps {
  form: UseFormReturn<RentalAnalysisForm>
  formValues: RentalAnalysisForm
  onCalculateSuggestedPrice?: () => void
}

export default function ComparableProperties({ form, formValues, onCalculateSuggestedPrice }: ComparablePropertiesProps) {
  const { register, setValue } = form
  const [activeComparables, setActiveComparables] = useState<number[]>([1])

  const addComparable = (index: number) => {
    if (!activeComparables.includes(index)) {
      setActiveComparables([...activeComparables, index])
    }
  }

  const removeComparable = (index: number) => {
    if (activeComparables.length > 1) {
      setActiveComparables(activeComparables.filter(i => i !== index))
      // Limpiar los campos del comparable eliminado
      const fields = ['link', 'address', 'm2', 'bedrooms', 'bathrooms', 'parking', 'storage', 'price']
      fields.forEach(field => {
        setValue(`comparable_${index}_${field}` as keyof RentalAnalysisForm, '')
      })
    }
  }

  const calculateSuggestedPrice = () => {
    const validComparables = activeComparables.filter(index => {
      const price = formValues[`comparable_${index}_price` as keyof RentalAnalysisForm]
      const m2 = formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm]
      return price && m2 && parseFloat(price) > 0 && parseFloat(m2) > 0
    })

    if (validComparables.length === 0) return

    const prices = validComparables.map(index => {
      const price = parseFloat(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '0')
      const m2 = parseFloat(formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] || '0')
      return { price, pricePerM2: price / m2 }
    })

    const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length
    const avgPricePerM2 = prices.reduce((sum, p) => sum + p.pricePerM2, 0) / prices.length

    // Sugerir precio basado en m2 de la propiedad
    const propertyM2 = parseFloat(formValues.property_size_m2) || 0
    const suggestedPrice = propertyM2 > 0 ? avgPricePerM2 * propertyM2 : avgPrice

    setValue('suggested_rent_clp', Math.round(suggestedPrice).toString())
    
    if (onCalculateSuggestedPrice) {
      onCalculateSuggestedPrice()
    }
  }

  const renderComparable = (index: number) => (
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

        {/* Precio por m² calculado */}
        {formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] && 
         formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] && (
          <div className="bg-blue-50 p-2 rounded text-xs">
            <span className="text-blue-800">
              💰 Precio por m²: ${Math.round(
                parseFloat(formValues[`comparable_${index}_price` as keyof RentalAnalysisForm] || '0') / 
                parseFloat(formValues[`comparable_${index}_m2` as keyof RentalAnalysisForm] || '1')
              ).toLocaleString()} CLP/m²
            </span>
          </div>
        )}
      </div>
    </div>
  )

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

      {/* Información */}
      <div className="bg-gray-50 p-3 rounded border">
        <p className="text-xs text-gray-600">
          <strong>💡 Uso de comparables:</strong> Si no deseas usar un comparable, simplemente elimínalo. 
          El sistema calcula el precio óptimo basado en las propiedades comparables disponibles.
        </p>
      </div>
    </div>
  )
}