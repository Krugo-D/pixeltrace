import { RiskAnalyzer } from './analyzer.interface';
import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export class TrainingDataAnalyzer implements RiskAnalyzer {
  category = RiskCategory.TRAINING_DATA;

  async analyze(insight: LLMInsight): Promise<RiskResult> {
    // This analyzer assesses ambiguity about training data sources
    const similarityCount = insight.similaritySignals.length;
    const styleCount = insight.styleIndicators.length;
    
    // Higher risk if image shows signs of being derived from copyrighted training data
    let score = Math.min(20 + (similarityCount * 8) + (styleCount * 6), 100);
    const confidence = 0.3; // Low confidence - this is inherently ambiguous
    
    let explanation = 'The image appears to be a unique AI-generated composition without clear indicators of specific training data sources.';
    if (similarityCount > 1 || styleCount > 2) {
      explanation = 'The image shows some characteristics that may indicate it was generated using training data that included copyrighted works. However, this is difficult to determine with certainty, and the legal status of AI training data remains an evolving area.';
      score = Math.max(score, 35);
    }
    
    return {
      category: this.category,
      score: Math.round(score),
      confidence: Math.round(confidence * 100) / 100,
      explanation,
    };
  }
}

