'use client'

import { useEffect, useState } from 'react'

interface LiveFeedbackProps {
  formValues: any
  currentSection: number
}

export default function LiveFeedback({ formValues, currentSection }: LiveFeedbackProps) {
  const [feedback, setFeedback] = useState<string>('')
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'info'>('info')

  useEffect(() => {
    if (currentSection === 1) {
      // Feedback para la primera sección
      if (!formValues.property_address) {
        setFeedback('👋 Comience escribiendo la dirección de su propiedad')
        setFeedbackType('info')
      } else if (!formValues.property_value_clp && !formValues.property_value_uf) {
        setFeedback('💰 Ahora ingrese el valor de su propiedad')
        setFeedbackType('info')
      } else if (!formValues.property_size_m2) {
        setFeedback('📐 Falta ingresar los metros cuadrados')
        setFeedbackType('info')
      } else {
        setFeedback('✨ ¡Excelente! Ya puede ir al siguiente paso')
        setFeedbackType('success')
      }
    } else if (currentSection === 2) {
      // Feedback para la segunda sección
      const hasValidRent = (formValues.suggested_rent_clp && parseFloat(formValues.suggested_rent_clp) > 0) || 
                          (formValues.suggested_rent_uf && parseFloat(formValues.suggested_rent_uf) > 0)
      
      if (!hasValidRent) {
        setFeedback('🎯 Use el botón "Calcular Precio Ideal" para obtener una sugerencia automática')
        setFeedbackType('info')
      } else {
        setFeedback('🎉 ¡Perfecto! Su análisis de rentabilidad está listo')
        setFeedbackType('success')
      }
    }
  }, [formValues, currentSection])

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const icon = {
    success: '🎉',
    warning: '⚠️',
    info: '💡'
  }

  if (!feedback) return null

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm p-4 rounded-lg border-2 shadow-lg transition-all duration-300 ${bgColor[feedbackType]} z-40`}>
      <div className="flex items-start space-x-3">
        <span className="text-xl">{icon[feedbackType]}</span>
        <div>
          <div className="font-medium text-sm">Siguiente paso:</div>
          <div className="text-sm">{feedback}</div>
        </div>
      </div>
    </div>
  )
}