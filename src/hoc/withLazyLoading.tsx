'use client'

import { Suspense, ComponentType } from 'react'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'

interface LazyLoadingOptions {
  fallbackType?: 'form' | 'map' | 'analysis' | 'table' | 'card'
  fallbackRows?: number
  showLoadingText?: boolean
  className?: string
  customFallback?: React.ReactNode
}

/**
 * HOC para agregar lazy loading automático a componentes
 * Envuelve el componente en Suspense con un skeleton de carga apropiado
 */
export function withLazyLoading<T extends object>(
  LazyComponent: ComponentType<T>,
  options: LazyLoadingOptions = {}
) {
  const {
    fallbackType = 'card',
    fallbackRows = 3,
    showLoadingText = true,
    className = '',
    customFallback
  } = options

  return function LazyLoadedComponent(props: T) {
    const fallback = customFallback || (
      <LoadingSkeleton
        type={fallbackType}
        rows={fallbackRows}
        showText={showLoadingText}
        className={className}
      />
    )

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Variantes específicas del HOC para casos comunes
export const withFormLazyLoading = <T extends object>(LazyComponent: ComponentType<T>) =>
  withLazyLoading(LazyComponent, { 
    fallbackType: 'form', 
    fallbackRows: 5,
    className: 'border rounded-lg bg-white'
  })

export const withMapLazyLoading = <T extends object>(LazyComponent: ComponentType<T>) =>
  withLazyLoading(LazyComponent, { 
    fallbackType: 'map',
    className: 'mt-3'
  })

export const withAnalysisLazyLoading = <T extends object>(LazyComponent: ComponentType<T>) =>
  withLazyLoading(LazyComponent, { 
    fallbackType: 'analysis', 
    fallbackRows: 4,
    showLoadingText: false
  })

export const withTableLazyLoading = <T extends object>(LazyComponent: ComponentType<T>) =>
  withLazyLoading(LazyComponent, { 
    fallbackType: 'table', 
    fallbackRows: 5
  })

export default withLazyLoading