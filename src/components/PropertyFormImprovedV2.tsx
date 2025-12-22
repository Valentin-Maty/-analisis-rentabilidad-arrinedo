'use client'

import { UseFormReturn } from 'react-hook-form'
import { useState } from 'react'
import type { RentalAnalysisForm } from '@/types/rental'
import AddressMap from './AddressMap'
import ComparableProperties from './ComparableProperties'
import { formatNumber, unformatNumber, handleNumberInput } from '@/utils/numberFormatter'

interface PropertyFormImprovedV2Props {
  form: UseFormReturn<RentalAnalysisForm>
  formValues: RentalAnalysisForm
  onSuggestRent: () => void
}

export default function PropertyFormImprovedV2({ form, formValues, onSuggestRent }: PropertyFormImprovedV2Props) {
  const { register, formState: { errors }, watch, setValue } = form
  const [activeSection, setActiveSection] = useState(1)
  const [showUF, setShowUF] = useState(false)
  const ufValue = parseFloat(formValues.uf_value_clp || '37000')

  const sections = [
    { id: 1, title: '🏠 Información de la Propiedad', icon: '🏠' },
    { id: 2, title: '💰 Análisis de Rentabilidad', icon: '💰' }
  ]

  const hasErrors = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        // Solo marca error si no hay NINGÚN valor válido (ni CLP ni UF > 0)
        const currentClp = watch('property_value_clp')
        const currentUf = watch('property_value_uf')
        const clpValue = parseFloat(currentClp || '0')
        const ufValue = parseFloat(currentUf || '0')
        const hasPropertyValueError = clpValue <= 0 && ufValue <= 0
        return !!(hasPropertyValueError || errors.property_size_m2)
      case 2:
        return formValues.rent_currency === 'CLP' ? !!(errors.suggested_rent_clp) : !!(errors.suggested_rent_uf)
      default:
        return false
    }
  }

  const isComplete = (sectionId: number) => {
    switch (sectionId) {
      case 1:
        // Usar watch para obtener valores actuales del formulario
        const currentClp = watch('property_value_clp')
        const currentUf = watch('property_value_uf')
        const currentM2 = watch('property_size_m2')
        
        const clpValue = parseFloat(currentClp || '0')
        const ufValue = parseFloat(currentUf || '0')
        const m2Value = parseFloat(currentM2 || '0')
        
        const hasValidPropertyValue = clpValue > 0 || ufValue > 0
        const hasValidM2 = m2Value > 0
        return !!(hasValidPropertyValue && hasValidM2)
      case 2:
        if (formValues.rent_currency === 'CLP') {
          return !!(formValues.suggested_rent_clp && parseFloat(formValues.suggested_rent_clp) > 0)
        } else {
          return !!(formValues.suggested_rent_uf && parseFloat(formValues.suggested_rent_uf) > 0)
        }
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Navegación por pestañas */}
      <div className="card">
        <div className="card-body p-0">
          <div className="grid grid-cols-2 gap-0">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`
                  p-4 text-center transition-all duration-300 relative
                  ${activeSection === section.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                  }
                  ${section.id === 1 ? 'rounded-tl-2xl' : ''}
                  ${section.id === sections.length ? 'rounded-tr-2xl' : ''}
                `}
              >
                <div className="text-2xl mb-2">{section.icon}</div>
                <div className="text-sm font-semibold">{section.title}</div>
                
                {/* Indicador de estado */}
                {isComplete(section.id) && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                )}
                
                {hasErrors(section.id) && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido de las secciones */}
      <div className="card min-h-[500px]">
        <div className="card-body">
          {activeSection === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">🏠 Información de la Propiedad</h3>
                <p className="text-gray-600">Datos básicos para el análisis de rentabilidad</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">📍 Dirección Completa</label>
                  <input
                    {...register('property_address')}
                    type="text"
                    className={`input`}
                    placeholder="Ej: Av. Providencia 123, Las Condes, Santiago (opcional)"
                  />
                  
                  {/* Mapa mejorado */}
                  <AddressMap address={formValues.property_address} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    {!showUF ? (
                      <>
                        <label className="label">💵 Valor Peso</label>
                        <div className="relative">
                          <input
                            type="text"
                            className={`input`}
                            placeholder="95.000.000"
                            value={formatNumber(formValues.property_value_clp || '')}
                            onChange={(e) => {
                              const cleanValue = unformatNumber(e.target.value)
                              setValue('property_value_clp', cleanValue)
                            }}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">CLP</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <button 
                            type="button" 
                            className="text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              const clpValue = parseFloat(formValues.property_value_clp || '0')
                              const ufCalculated = clpValue / ufValue
                              setValue('property_value_uf', ufCalculated.toFixed(2))
                              setShowUF(true)
                            }}
                          >
                            🔄 Cambiar a UF
                          </button>
                          <span className="text-xs text-gray-500">
                            (≈ {(parseFloat(formValues.property_value_clp || '0') / ufValue).toFixed(1)} UF)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <label className="label">💎 Valor UF</label>
                        <div className="relative">
                          <input
                            {...register('property_value_uf')}
                            type="number"
                            step="0.01"
                            className={`input`}
                            placeholder="2500"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">UF</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <button 
                            type="button" 
                            className="text-xs text-blue-600 hover:text-blue-700"
                            onClick={() => {
                              const ufValueProp = parseFloat(formValues.property_value_uf || '0')
                              const clpCalculated = ufValueProp * ufValue
                              setValue('property_value_clp', clpCalculated.toFixed(0))
                              setShowUF(false)
                            }}
                          >
                            🔄 Cambiar a Pesos
                          </button>
                          <span className="text-xs text-gray-500">
                            (≈ ${(parseFloat(formValues.property_value_uf || '0') * ufValue).toLocaleString('es-CL')} CLP)
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="label">📐 Metros Cuadrados *</label>
                    <div className="relative">
                      <input
                        {...register('property_size_m2', { required: 'Los m² son requeridos' })}
                        type="number"
                        className={`input ${errors.property_size_m2 ? 'input-error' : ''}`}
                        placeholder="75"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">m²</span>
                    </div>
                    {errors.property_size_m2 && (
                      <p className="error-text">{errors.property_size_m2.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="label">🛏️ Dormitorios</label>
                    <select {...register('bedrooms')} className="input">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">🚿 Baños</label>
                    <select {...register('bathrooms')} className="input">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">🚗 Estacionam.</label>
                    <select {...register('parking_spaces')} className="input">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">📦 Bodegas</label>
                    <select {...register('storage_units')} className="input">
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>
                
                {/* Campo valor UF actual */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-blue-900">💱 Valor UF Hoy</label>
                      <p className="text-xs text-blue-700">Actualiza el valor para cálculos precisos</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">$</span>
                      <input
                        {...register('uf_value_clp')}
                        type="number"
                        className="input input-sm w-24"
                        placeholder="37000"
                        defaultValue="37000"
                      />
                      <span className="text-sm text-gray-600">CLP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSection(2)}
                  className="btn btn-primary"
                  disabled={!isComplete(1)}
                >
                  Siguiente: Análisis de Rentabilidad →
                </button>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">💰 Análisis de Rentabilidad</h3>
                <p className="text-gray-600">Define el precio de arriendo y calcula la rentabilidad</p>
              </div>

              {/* Comparables */}
              <ComparableProperties 
                form={form}
                formValues={formValues}
                onCalculateSuggestedPrice={onSuggestRent}
              />

              {/* Precio sugerido */}
              <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-bold text-purple-900">💵 Precio de Arriendo</label>
                  <button
                    type="button"
                    onClick={onSuggestRent}
                    className="btn btn-secondary text-xs"
                    disabled={!formValues.property_size_m2}
                  >
                    ✨ Sugerir Precio
                  </button>
                </div>
                
                {/* Toggle de Moneda */}
                <div className="mb-4">
                  <div className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Moneda:</span>
                    <div className="flex space-x-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          {...register('rent_currency')}
                          type="radio"
                          value="CLP"
                          className="text-purple-600"
                          defaultChecked
                        />
                        <span className="text-sm font-medium">💵 CLP (Pesos)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          {...register('rent_currency')}
                          type="radio"
                          value="UF"
                          className="text-purple-600"
                        />
                        <span className="text-sm font-medium">💎 UF</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Campo de precio */}
                {formValues.rent_currency === 'CLP' ? (
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        className={`input text-lg font-bold ${errors.suggested_rent_clp ? 'input-error' : ''}`}
                        placeholder="500.000"
                        value={formatNumber(formValues.suggested_rent_clp || '')}
                        onChange={(e) => {
                          const cleanValue = unformatNumber(e.target.value)
                          setValue('suggested_rent_clp', cleanValue)
                        }}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">CLP/mes</span>
                    </div>
                    {errors.suggested_rent_clp && (
                      <p className="error-text">{errors.suggested_rent_clp.message}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <input
                        {...register('suggested_rent_uf', { 
                          required: 'El precio es requerido'
                        })}
                        type="number"
                        step="0.01"
                        className={`input text-lg font-bold ${errors.suggested_rent_uf ? 'input-error' : ''}`}
                        placeholder="13.5"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">UF/mes</span>
                    </div>
                    {errors.suggested_rent_uf && (
                      <p className="error-text">{errors.suggested_rent_uf.message}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      ≈ ${Math.round(parseFloat(formValues.suggested_rent_uf || '0') * ufValue).toLocaleString('es-CL')} CLP
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveSection(1)}
                  className="btn btn-secondary"
                >
                  ← Datos de Propiedad
                </button>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    ✅ Análisis de rentabilidad completado. Listo para generar el plan comercial.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}