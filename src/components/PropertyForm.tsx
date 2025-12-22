'use client'

import { UseFormReturn } from 'react-hook-form'
import type { RentalAnalysisForm } from '@/types/rental'

interface PropertyFormProps {
  form: UseFormReturn<RentalAnalysisForm>
  formValues: RentalAnalysisForm
  onSuggestRent: () => void
}

export default function PropertyForm({ form, formValues, onSuggestRent }: PropertyFormProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">Datos de la Propiedad</h3>
        <p className="text-sm text-gray-600 mt-1">
          Completa la información básica de la propiedad para análisis
        </p>
      </div>
      
      <div className="card-body space-y-6">
        {/* Datos Básicos de la Propiedad */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Información General</h4>
          
          <div>
            <label className="label">Dirección de la Propiedad *</label>
            <input
              {...register('property_address', { required: 'La dirección es requerida' })}
              type="text"
              className={`input ${errors.property_address ? 'input-error' : ''}`}
              placeholder="Ej: Av. Providencia 123, Las Condes"
            />
            {errors.property_address && (
              <p className="error-text">{errors.property_address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Valor de la Propiedad (UF) *</label>
              <input
                {...register('property_value_uf', { required: 'El valor es requerido' })}
                type="number"
                step="0.01"
                className={`input ${errors.property_value_uf ? 'input-error' : ''}`}
                placeholder="Ej: 2500"
              />
              {errors.property_value_uf && (
                <p className="error-text">{errors.property_value_uf.message}</p>
              )}
            </div>

            <div>
              <label className="label">Metros Cuadrados *</label>
              <input
                {...register('property_size_m2', { required: 'Los m² son requeridos' })}
                type="number"
                className={`input ${errors.property_size_m2 ? 'input-error' : ''}`}
                placeholder="Ej: 75"
              />
              {errors.property_size_m2 && (
                <p className="error-text">{errors.property_size_m2.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Dormitorios</label>
              <select {...register('bedrooms')} className="input">
                <option value="1">1 Dormitorio</option>
                <option value="2">2 Dormitorios</option>
                <option value="3">3 Dormitorios</option>
                <option value="4">4+ Dormitorios</option>
              </select>
            </div>

            <div>
              <label className="label">Baños</label>
              <select {...register('bathrooms')} className="input">
                <option value="1">1 Baño</option>
                <option value="2">2 Baños</option>
                <option value="3">3 Baños</option>
                <option value="4">4+ Baños</option>
              </select>
            </div>
          </div>
        </div>

        {/* Análisis de Precio */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Análisis de Mercado</h4>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label">Precio Sugerido de Arriendo (CLP) *</label>
              <button
                type="button"
                onClick={onSuggestRent}
                className="btn btn-secondary text-xs py-1 px-2"
                disabled={!formValues.property_size_m2}
              >
                Sugerir Precio
              </button>
            </div>
            <input
              {...register('suggested_rent_clp', { required: 'El precio sugerido es requerido' })}
              type="number"
              className={`input ${errors.suggested_rent_clp ? 'input-error' : ''}`}
              placeholder="Ej: 800000"
            />
            {errors.suggested_rent_clp && (
              <p className="error-text">{errors.suggested_rent_clp.message}</p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              Base para el cálculo de los planes A, B y C
            </p>
          </div>

          <div>
            <label className="label">Notas del Estudio de Mercado</label>
            <textarea
              {...register('market_study_notes')}
              rows={3}
              className="input resize-none"
              placeholder="Ej: Zona con alta demanda, cercana a metro, edificio nuevo..."
            />
          </div>
        </div>

        {/* Configuración de Planes */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Configuración de Comisiones</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Plan A - Premium (%)</label>
              <input
                {...register('plan_a_commission')}
                type="number"
                step="0.1"
                className="input"
                placeholder="12"
              />
            </div>
            
            <div>
              <label className="label">Plan B - Estándar (%)</label>
              <input
                {...register('plan_b_commission')}
                type="number"
                step="0.1"
                className="input"
                placeholder="10"
              />
            </div>
            
            <div>
              <label className="label">Plan C - Básico (%)</label>
              <input
                {...register('plan_c_commission')}
                type="number"
                step="0.1"
                className="input"
                placeholder="8"
              />
            </div>
          </div>
        </div>

        {/* Gastos Operacionales */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b pb-2">Gastos Anuales Estimados</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mantención Anual (CLP)</label>
              <input
                {...register('annual_maintenance_clp')}
                type="number"
                className="input"
                placeholder="500000"
              />
            </div>

            <div>
              <label className="label">Contribuciones Anuales (CLP)</label>
              <input
                {...register('annual_property_tax_clp')}
                type="number"
                className="input"
                placeholder="300000"
              />
            </div>
            
            <div>
              <label className="label">Seguro Anual (CLP)</label>
              <input
                {...register('annual_insurance_clp')}
                type="number"
                className="input"
                placeholder="200000"
              />
            </div>

            <div>
              <label className="label">Valor UF Actual (CLP)</label>
              <input
                {...register('uf_value_clp')}
                type="number"
                className="input"
                placeholder="38000"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}