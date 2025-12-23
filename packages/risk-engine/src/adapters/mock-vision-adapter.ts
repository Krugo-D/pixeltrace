import { VisionLLMAdapter, LLMInsight } from '@pixeltrace/shared-types';

export class MockVisionLLMAdapter implements VisionLLMAdapter {
  async analyzeImage(imageUrl: string): Promise<LLMInsight> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return deterministic fake data based on image URL hash
    const hash = this.simpleHash(imageUrl);
    
    return {
      visualDescription: 'A generated image featuring abstract geometric patterns with vibrant color gradients',
      detectedElements: ['geometric shapes', 'color gradients', 'abstract composition'],
      similaritySignals: hash % 2 === 0 ? ['resembles common stock photo patterns'] : ['unique visual composition'],
      brandReferences: hash % 3 === 0 ? ['potential logo-like elements'] : [],
      styleIndicators: ['digital art style', 'modern aesthetic'],
      characterLikeness: hash % 5 === 0 ? ['possible humanoid features'] : [],
      commercialContext: ['suitable for digital marketing', 'web-friendly format'],
    };
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

