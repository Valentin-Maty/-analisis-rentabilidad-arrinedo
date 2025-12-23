// Tipos para análisis de rentabilidad de arriendos

export interface Property {
  id: string;
  address: string;
  value_clp: number; // Valor principal en pesos
  value_uf?: number; // Valor secundario en UF
  market_rent_clp: number;
  size_m2?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number; // Estacionamientos
  storage_units?: number; // Bodegas
}

// Planes de arriendo A, B, C
export interface RentalPlan {
  id: 'A' | 'B' | 'C';
  name: string;
  description: string;
  initial_rent_clp: number;
  commission_percentage: number;
  marketing_duration_days: number;
  price_adjustment_schedule: PriceAdjustment[];
  service_level: 'basic' | 'standard' | 'premium';
}

export interface PriceAdjustment {
  day: number; // Día desde la publicación
  new_rent_clp: number;
  percentage_reduction: number;
}

// Análisis de rentabilidad
export interface RentalAnalysis {
  property: Property;
  plans: RentalPlan[];
  market_study: MarketStudy;
  cap_rate_analysis: CapRateAnalysis;
  vacancy_impact: VacancyImpact;
  recommended_initial_rent: number;
}

// Propiedades comparables para análisis
export interface ComparableProperty {
  id: number; // 1, 2, 3
  address: string;
  size_m2: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  storage_units: number;
  rent_clp: number;
  price_per_m2: number;
  link?: string; // Link de la publicación
}

export interface MarketStudy {
  comparable_properties: ComparableProperty[];
  average_rent_per_m2: number;
  market_range: {
    min_rent_clp: number;
    max_rent_clp: number;
  };
  neighborhood_factors: {
    location_score: number; // 1-10
    transportation_access: number; // 1-10
    amenities_score: number; // 1-10
  };
}

export interface CapRateAnalysis {
  property_value_clp: number;
  annual_rental_income: number;
  annual_expenses: number; // mantención, contribuciones, etc.
  net_operating_income: number;
  cap_rate_percentage: number;
  comparison_to_market: 'above' | 'average' | 'below';
}

export interface VacancyImpact {
  days_vacant: number;
  percentage_annual_loss: number; // 1 mes vacante = 8.33% pérdida anual
  lost_income_clp: number;
  break_even_reduction_percentage: number; // % que se puede reducir el precio para evitar vacancia
}

// Estados del proceso
export interface ClientResponse {
  plan_ids_accepted: Array<'A' | 'B' | 'C'>;
  response_date: Date;
  client_email: string;
  broker_email: string;
  notes?: string;
}

export interface RentalProposal {
  id: string;
  property: Property;
  analysis: RentalAnalysis;
  client_response?: ClientResponse;
  status: 'pending_review' | 'sent_to_client' | 'client_responded' | 'published' | 'cancelled';
  created_at: Date;
  expires_at: Date; // Para el proceso de 30 días
}

// Alertas y seguimiento
export interface PriceAlert {
  id: string;
  property_id: string;
  current_rent: number;
  suggested_new_rent: number;
  reason: 'low_visits' | 'no_applications' | 'market_change' | 'time_based';
  days_since_publication: number;
  visits_count: number;
  applications_count: number;
  created_at: Date;
}

// Formulario de entrada de datos
export interface RentalAnalysisForm {
  // Datos de la propiedad
  property_address: string;
  property_value_clp: string; // Valor principal en pesos chilenos
  property_value_uf?: string; // Valor secundario en UF (opcional)
  property_size_m2: string;
  bedrooms: string;
  bathrooms: string;
  parking_spaces: string; // Estacionamientos (predeterminado: 0)
  storage_units: string; // Bodegas (predeterminado: 0)
  
  // Precio inicial sugerido
  suggested_rent_clp: string;
  suggested_rent_uf: string;
  rent_currency: 'CLP' | 'UF';
  
  // Precio de captación de la propiedad
  capture_price_clp?: string;
  capture_price_uf?: string;
  capture_price_currency?: 'CLP' | 'UF';
  
  market_study_notes: string;
  
  // Configuración de planes
  plan_a_commission: string;
  plan_b_commission: string;
  plan_c_commission: string;
  
  // Gastos anuales estimados
  annual_maintenance_clp: string;
  annual_property_tax_clp: string;
  annual_insurance_clp: string;
  
  // UF actual
  uf_value_clp: string;
  
  // Propiedades comparables
  comparable_1_link?: string;
  comparable_1_address?: string;
  comparable_1_m2?: string;
  comparable_1_bedrooms?: string;
  comparable_1_bathrooms?: string;
  comparable_1_parking?: string;
  comparable_1_storage?: string;
  comparable_1_price?: string;
  
  comparable_2_link?: string;
  comparable_2_address?: string;
  comparable_2_m2?: string;
  comparable_2_bedrooms?: string;
  comparable_2_bathrooms?: string;
  comparable_2_parking?: string;
  comparable_2_storage?: string;
  comparable_2_price?: string;
  
  comparable_3_link?: string;
  comparable_3_address?: string;
  comparable_3_m2?: string;
  comparable_3_bedrooms?: string;
  comparable_3_bathrooms?: string;
  comparable_3_parking?: string;
  comparable_3_storage?: string;
  comparable_3_price?: string;
}

// Cálculos derivados
export interface RentalCalculations {
  cap_rate: number;
  annual_rental_yield: number;
  monthly_net_income: number;
  vacancy_cost_per_month: number;
  break_even_rent_reduction: number;
  plan_comparisons: PlanComparison[];
}

export interface PlanComparison {
  plan_id: 'A' | 'B' | 'C';
  expected_rental_time: number; // días
  total_commission: number;
  net_annual_income: number;
  vacancy_risk_score: number; // 1-10
  recommendation_score: number; // 1-10
}