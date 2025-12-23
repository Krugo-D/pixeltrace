import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export interface RiskAnalyzer {
  category: RiskCategory;
  analyze(insight: LLMInsight): Promise<RiskResult>;
}

