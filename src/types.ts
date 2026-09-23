export type BackupPowerType = 'solar_inverter' | 'generator' | 'hybrid' | 'none';
export type WaterSourceType = 'treated_borehole' | 'untreated_borehole' | 'water_corporation' | 'well';
export type MeterType = 'dedicated_prepaid' | 'shared_prepaid' | 'estimated_analog';
export type SecurityType = 'gated_night_guard' | 'gated_only' | 'open_street';
export type FloodRiskType = 'zero_flood_zone' | 'moderate_seasonal' | 'high_risk';

export interface UtilityScorecard {
  gridHoursPerDay: number;           // e.g. 16 hours
  backupPowerType: BackupPowerType;
  inverterCapacityKva?: number;       // e.g. 3.5 kVA
  waterSource: WaterSourceType;
  meterType: MeterType;
  compoundSecurity: SecurityType;
  floodRiskLevel: FloodRiskType;
  verifiedByAi: boolean;
  communityRating: number;           // 1 to 5
}

export interface LandlordPreferences {
  employmentStatus: 'working_professional' | 'business_owner' | 'student_allowed' | 'any';
  maritalStatusPreference: 'singles_welcome' | 'married_preferred' | 'any';
  religiousPreference: 'any' | 'christian' | 'muslim';
  smokingAllowed: boolean;
  maxOccupants: number;
}

export interface PropertyListing {
  id: string;
  title: string;
  description: string;
  area: string; // e.g. "Yaba", "Surulere", "Lekki Phase 1", "Ikeja GRA", "Garki"
  city: string; // e.g. "Lagos", "Abuja"
  address: string;
  annualRent: number; // in NGN
  monthlyEquivalent: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: 'self_contained' | 'one_bedroom' | 'two_bedroom' | 'three_bedroom';
  photos: string[];
  utility: UtilityScorecard;
  preferences: LandlordPreferences;
  landlord: {
    name: string;
    verifiedOwner: boolean;
    yearsAsOwner: number;
    avatar: string;
    phoneMasked: string;
    bio: string;
  };
  aiAuditNotes: string[];
  dateAdded: string;
}

export interface ChatMessage {
  id: string;
  propertyId: string;
  senderRole: 'tenant' | 'landlord' | 'ai_mediator';
  senderName: string;
  text: string;
  timestamp: string;
  isInspectionRequest?: boolean;
  inspectionDate?: string;
}

export interface TenancyAgreementData {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  landlordName: string;
  tenantName: string;
  annualRent: number;
  commencementDate: string;
  durationMonths: number;
  utilitySummary: string;
  houseRules: string[];
  agencyFeeSaved: number;
  legalFeeSaved: number;
  totalDirectSavings: number;
  sha256VerificationHash: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCity: string;
  selectedArea: string;
  maxRent: number;
  solarInverterOnly: boolean;
  dedicatedPrepaidOnly: boolean;
  treatedBoreholeOnly: boolean;
  gatedSecurityOnly: boolean;
  bedrooms: number | 'all';
}
