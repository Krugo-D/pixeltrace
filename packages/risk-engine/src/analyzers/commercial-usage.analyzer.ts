import { RiskAnalyzer } from './analyzer.interface';
import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export class CommercialUsageAnalyzer implements RiskAnalyzer {
  category = RiskCategory.COMMERCIAL_USAGE;

  async analyze(insight: LLMInsight): Promise<RiskResult> {
    // Aggregate risk from other factors for commercial usage assessment
    const brandRisk = insight.brandReferences.length > 0;
    const characterRisk = insight.characterLikeness.length > 0;
    const similarityRisk = insight.similaritySignals.length > 1;
    
    let score = 20; // Base risk
    if (brandRisk) score += 25;
    if (characterRisk) score += 20;
    if (similarityRisk) score += 15;
    
    score = Math.min(score, 100);
    const confidence = Math.min(0.5 + ((brandRisk ? 0.15 : 0) + (characterRisk ? 0.15 : 0) + (similarityRisk ? 0.1 : 0)), 1.0);
    
    let explanation = 'The image appears suitable for commercial use with standard precautions.';
    const riskFactors: string[] = [];
    if (brandRisk) riskFactors.push('potential brand confusion');
    if (characterRisk) riskFactors.push('character likeness concerns');
    if (similarityRisk) riskFactors.push('visual similarity to existing works');
    
    if (riskFactors.length > 0) {
      explanation = `Commercial usage may carry risk due to ${riskFactors.join(', ')}. Consider additional legal review before using in high-visibility campaigns, particularly in global markets with strict IP enforcement.`;
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

