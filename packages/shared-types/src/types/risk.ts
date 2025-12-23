export enum RiskCategory {
  VISUAL_SIMILARITY = 'VISUAL_SIMILARITY',
  TRADEMARK = 'TRADEMARK',
  COPYRIGHT = 'COPYRIGHT',
  CHARACTER = 'CHARACTER',
  TRAINING_DATA = 'TRAINING_DATA',
  COMMERCIAL_USAGE = 'COMMERCIAL_USAGE',
}

export enum RiskTier {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface RiskResult {
  category: RiskCategory;
  score: number; // 0-100
  confidence: number; // 0-1
  explanation: string;
}

export interface AnalysisResult {
  overallScore: number; // 0-100
  riskTier: RiskTier;
  results: RiskResult[];
}

