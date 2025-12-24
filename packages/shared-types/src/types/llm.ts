export interface LLMInsight {
  visualDescription: string;
  detectedElements: string[];
  similaritySignals: string[];
  brandReferences: string[];
  styleIndicators: string[];
  characterLikeness: string[];
  commercialContext: string[];
}

export interface RiskScores {
  visualSimilarity: { score: number; confidence: number };
  trademark: { score: number; confidence: number };
  copyright: { score: number; confidence: number };
  character: { score: number; confidence: number };
  trainingData: { score: number; confidence: number };
  commercialUsage: { score: number; confidence: number };
}

export interface VisionLLMAdapter {
  analyzeImage(imageUrl: string): Promise<LLMInsight>;
  analyzeImageScores(imageUrl: string): Promise<RiskScores>;
}

