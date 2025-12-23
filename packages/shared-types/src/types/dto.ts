import { RiskTier, RiskCategory } from './risk';

export interface AssetResponse {
  id: string;
  filename: string;
  mimeType: string;
  createdAt: string;
}

export interface RiskResultDTO {
  id: string;
  category: RiskCategory;
  score: number;
  confidence: number;
  explanation: string;
}

export interface AnalysisRunResponse {
  id: string;
  assetId: string;
  startedAt: string;
  completedAt: string | null;
  overallScore: number | null;
  riskTier: RiskTier | null;
  results: RiskResultDTO[];
}

