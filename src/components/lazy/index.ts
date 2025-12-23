import { lazy } from 'react'

// Lazy loading para componentes pesados
export const ComparablePropertiesLazy = lazy(() => import('@/components/ComparableProperties'))
export const AnalysisPreviewLazy = lazy(() => import('@/components/AnalysisPreview'))
export const AddressMapLazy = lazy(() => import('@/components/AddressMap'))

// Lazy loading para componentes de análisis avanzados
export const AnalysisResultsImprovedLazy = lazy(() => import('@/components/AnalysisResultsImproved'))
export const PropertyFormImprovedLazy = lazy(() => import('@/components/PropertyFormImproved'))
export const RentalPlansImprovedLazy = lazy(() => import('@/components/RentalPlansImproved'))

// Lazy loading para páginas completas
export const AnalysesPageLazy = lazy(() => import('@/app/analyses/page'))
export const ClientReviewPageLazy = lazy(() => import('@/app/cliente/[token]/page'))

export default {
  AnalysisPreviewLazy,
  ComparablePropertiesLazy,
  AddressMapLazy,
  AnalysisResultsImprovedLazy,
  PropertyFormImprovedLazy,
  RentalPlansImprovedLazy,
  AnalysesPageLazy,
  ClientReviewPageLazy
}