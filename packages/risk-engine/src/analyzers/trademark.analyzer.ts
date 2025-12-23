import { RiskAnalyzer } from './analyzer.interface';
import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export class TrademarkAnalyzer implements RiskAnalyzer {
  category = RiskCategory.TRADEMARK;

  async analyze(insight: LLMInsight): Promise<RiskResult> {
    const brandRefCount = insight.brandReferences.length;
    const logoLikeElements = insight.detectedElements.filter(el => 
      el.toLowerCase().includes('logo') || 
      el.toLowerCase().includes('symbol') ||
      el.toLowerCase().includes('mark')
    ).length;
    
    // Higher risk if brand references or logo-like elements detected
    let score = Math.min(20 + (brandRefCount * 25) + (logoLikeElements * 20), 100);
    const confidence = Math.min(0.4 + (brandRefCount * 0.2), 1.0);
    
    let explanation = 'No significant trademark-like elements detected in the image.';
    if (brandRefCount > 0 || logoLikeElements > 0) {
      explanation = `The image contains elements that ${insight.brandReferences.length > 0 ? insight.brandReferences.join(', ') : 'may resemble trademarked designs'}. This could be confused with an existing brand, particularly if used in global advertising campaigns.`;
      score = Math.max(score, 50);
    }
    
    return {
      category: this.category,
      score: Math.round(score),
      confidence: Math.round(confidence * 100) / 100,
      explanation,
    };
  }
}

