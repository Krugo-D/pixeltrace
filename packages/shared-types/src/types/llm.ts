export interface LLMInsight {
  visualDescription: string;
  detectedElements: string[];
  similaritySignals: string[];
  brandReferences: string[];
  styleIndicators: string[];
  characterLikeness: string[];
  commercialContext: string[];
}

export interface VisionLLMAdapter {
  analyzeImage(imageUrl: string): Promise<LLMInsight>;
}

