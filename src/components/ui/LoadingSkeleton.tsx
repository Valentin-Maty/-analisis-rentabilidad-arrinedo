'use client'

import { memo } from 'react'

interface LoadingSkeletonProps {
  type?: 'form' | 'map' | 'analysis' | 'table' | 'card'
  rows?: number
  showText?: boolean
  className?: string
}

function LoadingSkeleton({ 
  type = 'card', 
  rows = 3, 
  showText = true,
  className = '' 
}: LoadingSkeletonProps) {
  const baseClass = "animate-pulse bg-gray-200 rounded"
  
  const renderFormSkeleton = () => (
    <div className={`space-y-4 p-6 ${className}`}>
      <div className={`${baseClass} h-6 w-3/4`} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className={`${baseClass} h-4 w-1/4`} />
          <div className={`${baseClass} h-10 w-full`} />
        </div>
      ))}
      <div className="flex space-x-3">
        <div className={`${baseClass} h-10 w-24`} />
        <div className={`${baseClass} h-10 w-24`} />
      </div>
    </div>
  )

  const renderMapSkeleton = () => (
    <div className={`space-y-3 p-3 border-2 border-gray-200 rounded-lg bg-gray-50 ${className}`}>
      <div className={`${baseClass} h-4 w-2/3`} />
      <div className={`${baseClass} h-48 w-full rounded-lg`} />
      <div className="flex justify-between">
        <div className={`${baseClass} h-3 w-24`} />
        <div className={`${baseClass} h-3 w-32`} />
      </div>
    </div>
  )

  const renderAnalysisSkeleton = () => (
    <div className={`space-y-6 p-8 bg-white rounded-xl ${className}`}>
      {/* Header skeleton */}
      <div className="bg-gray-700 p-8 rounded-xl -m-8 mb-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="animate-pulse bg-gray-500 rounded h-8 w-64" />
            <div className="animate-pulse bg-gray-500 rounded h-6 w-48" />
            <div className="animate-pulse bg-gray-500 rounded h-4 w-72" />
          </div>
          <div className="space-y-1">
            <div className="animate-pulse bg-gray-500 rounded h-4 w-24" />
            <div className="animate-pulse bg-gray-500 rounded h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <div className={`${baseClass} h-12 w-24 mx-auto`} />
            <div className={`${baseClass} h-4 w-32 mx-auto`} />
          </div>
        ))}
      </div>

      {/* Additional content blocks */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className={`${baseClass} h-6 w-48`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className={`${baseClass} h-4 w-full`} />
              <div className={`${baseClass} h-4 w-3/4`} />
            </div>
            <div className="space-y-2">
              <div className={`${baseClass} h-4 w-full`} />
              <div className={`${baseClass} h-4 w-2/3`} />
            </div>
          </div>
        </div>
      ))}

      {/* Action buttons skeleton */}
      <div className="flex space-x-4 pt-4">
        <div className={`${baseClass} h-10 w-32`} />
        <div className={`${baseClass} h-10 w-24`} />
      </div>
    </div>
  )

  const renderTableSkeleton = () => (
    <div className={`space-y-4 ${className}`}>
      <div className={`${baseClass} h-6 w-48`} />
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${baseClass} h-4 w-20`} />
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b last:border-b-0">
            <div className="flex space-x-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className={`${baseClass} h-4 w-20`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderCardSkeleton = () => (
    <div className={`border rounded-lg p-6 space-y-4 ${className}`}>
      <div className={`${baseClass} h-6 w-3/4`} />
      <div className="space-y-2">
        <div className={`${baseClass} h-4 w-full`} />
        <div className={`${baseClass} h-4 w-5/6`} />
        <div className={`${baseClass} h-4 w-4/6`} />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className={`${baseClass} h-4 w-24`} />
        <div className={`${baseClass} h-8 w-20`} />
      </div>
    </div>
  )

  const renderSkeleton = () => {
    switch (type) {
      case 'form':
        return renderFormSkeleton()
      case 'map':
        return renderMapSkeleton()
      case 'analysis':
        return renderAnalysisSkeleton()
      case 'table':
        return renderTableSkeleton()
      case 'card':
      default:
        return renderCardSkeleton()
    }
  }

  return (
    <div className="w-full">
      {renderSkeleton()}
      {showText && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            ⏳ Cargando contenido...
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(LoadingSkeleton)