import { RiskAnalyzer } from './analyzer.interface';
import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export class CopyrightAnalyzer implements RiskAnalyzer {
  category = RiskCategory.COPYRIGHT;

  async analyze(insight: LLMInsight): Promise<RiskResult> {
    const styleCount = insight.styleIndicators.length;
    const similarityCount = insight.similaritySignals.length;
    
    // Higher risk if distinctive style indicators suggest mimicry
    let score = Math.min(25 + (styleCount * 10) + (similarityCount * 8), 100);
    const confidence = Math.min(0.3 + (styleCount * 0.15), 0.9);
    
    let explanation = 'The image does not appear to closely mimic a copyrighted visual style.';
    if (styleCount > 2) {
      explanation = `The image exhibits ${insight.styleIndicators.join(', ')}. While style itself is not copyrightable, close mimicry of a distinctive artistic style may raise concerns, especially if the style is strongly associated with a particular creator or brand.`;
      score = Math.max(score, 45);
    }
    
    return {
      category: this.category,
      score: Math.round(score),
      confidence: Math.round(confidence * 100) / 100,
      explanation,
    };
  }
}

