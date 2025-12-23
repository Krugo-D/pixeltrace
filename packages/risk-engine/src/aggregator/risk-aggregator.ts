import { RiskResult, RiskTier, AnalysisResult, RiskCategory } from '@pixeltrace/shared-types';

export class RiskAggregator {
  // Weight configuration for different risk categories
  private weights: Record<RiskCategory, number> = {
    [RiskCategory.VISUAL_SIMILARITY]: 0.15,
    [RiskCategory.TRADEMARK]: 0.25,
    [RiskCategory.COPYRIGHT]: 0.15,
    [RiskCategory.CHARACTER]: 0.20,
    [RiskCategory.TRAINING_DATA]: 0.10,
    [RiskCategory.COMMERCIAL_USAGE]: 0.15,
  };

  aggregate(results: RiskResult[]): AnalysisResult {
    // Calculate weighted average
    let weightedSum = 0;
    let totalWeight = 0;

    for (const result of results) {
      const weight = this.weights[result.category] || 0.1;
      weightedSum += result.score * weight;
      totalWeight += weight;
    }

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    const riskTier = this.determineRiskTier(overallScore);

    return {
      overallScore,
      riskTier,
      results,
    };
  }

  private determineRiskTier(score: number): RiskTier {
    if (score < 30) return RiskTier.LOW;
    if (score < 60) return RiskTier.MEDIUM;
    return RiskTier.HIGH;
  }
}

