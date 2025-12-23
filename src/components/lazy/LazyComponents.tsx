'use client'

import { 
  withAnalysisLazyLoading, 
  withFormLazyLoading, 
  withMapLazyLoading,
  withTableLazyLoading
} from '@/hoc/withLazyLoading'

import {
  AnalysisPreviewLazy,
  ComparablePropertiesLazy,
  AddressMapLazy,
  AnalysisResultsImprovedLazy,
  PropertyFormImprovedLazy,
  RentalPlansImprovedLazy
} from './index'

// Componentes lazy con fallbacks apropiados
export const LazyAnalysisPreview = withAnalysisLazyLoading(AnalysisPreviewLazy)
export const LazyComparableProperties = withFormLazyLoading(ComparablePropertiesLazy)
export const LazyAddressMap = withMapLazyLoading(AddressMapLazy)
export const LazyAnalysisResultsImproved = withAnalysisLazyLoading(AnalysisResultsImprovedLazy)
export const LazyPropertyFormImproved = withFormLazyLoading(PropertyFormImprovedLazy)
export const LazyRentalPlansImproved = withFormLazyLoading(RentalPlansImprovedLazy)

// Export por defecto con todos los componentes lazy
export default {
  LazyAnalysisPreview,
  LazyComparableProperties,
  LazyAddressMap,
  LazyAnalysisResultsImproved,
  LazyPropertyFormImproved,
  LazyRentalPlansImproved
}