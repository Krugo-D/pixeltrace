import { RiskAnalyzer } from './analyzer.interface';
import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export class CharacterAnalyzer implements RiskAnalyzer {
  category = RiskCategory.CHARACTER;

  async analyze(insight: LLMInsight): Promise<RiskResult> {
    const likenessCount = insight.characterLikeness.length;
    const humanoidElements = insight.detectedElements.filter(el =>
      el.toLowerCase().includes('human') ||
      el.toLowerCase().includes('face') ||
      el.toLowerCase().includes('person') ||
      el.toLowerCase().includes('character')
    ).length;
    
    // Higher risk if character or human likeness detected
    let score = Math.min(15 + (likenessCount * 30) + (humanoidElements * 15), 100);
    const confidence = Math.min(0.35 + (likenessCount * 0.25), 1.0);
    
    let explanation = 'No significant character or celebrity likeness detected.';
    if (likenessCount > 0 || humanoidElements > 0) {
      explanation = `The image contains ${insight.characterLikeness.length > 0 ? insight.characterLikeness.join(', ') : 'humanoid or character-like features'}. There is a potential risk if these features could be confused with a real person or copyrighted character, particularly in commercial advertising contexts.`;
      score = Math.max(score, 55);
    }
    
    return {
      category: this.category,
      score: Math.round(score),
      confidence: Math.round(confidence * 100) / 100,
      explanation,
    };
  }
}

