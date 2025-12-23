import { RiskAnalyzer } from './analyzer.interface';
import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export class VisualSimilarityAnalyzer implements RiskAnalyzer {
  category = RiskCategory.VISUAL_SIMILARITY;

  async analyze(insight: LLMInsight): Promise<RiskResult> {
    const similarityCount = insight.similaritySignals.length;
    const detectedCount = insight.detectedElements.length;
    
    // Higher risk if many similarity signals or common patterns detected
    let score = Math.min(30 + (similarityCount * 15) + (detectedCount * 5), 100);
    const confidence = Math.min(0.5 + (similarityCount * 0.1), 1.0);
    
    let explanation = 'The image appears to have a relatively unique visual composition.';
    if (similarityCount > 0) {
      explanation = `The image ${insight.similaritySignals.join(', ')}. This may indicate potential similarity to existing visual works, which could raise concerns if used in commercial contexts.`;
      score = Math.max(score, 40);
    }
    
    return {
      category: this.category,
      score: Math.round(score),
      confidence: Math.round(confidence * 100) / 100,
      explanation,
    };
  }
}

