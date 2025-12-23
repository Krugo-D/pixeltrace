import { VisionLLMAdapter, LLMInsight } from '@pixeltrace/shared-types';
import OpenAI from 'openai';

export class OpenAIVisionAdapter implements VisionLLMAdapter {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async analyzeImage(imageUrl: string): Promise<LLMInsight> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image for IP and commercial risk assessment. Provide:
1. A detailed visual description
2. Detected visual elements (shapes, objects, patterns)
3. Similarity signals (what it might resemble)
4. Brand references (logos, trademarks, brand-like elements)
5. Style indicators (artistic style, visual characteristics)
6. Character likeness (human or character-like features)
7. Commercial context (suitability for commercial use)

Format your response as a structured analysis focusing on potential IP concerns.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Parse the response into structured data
      return this.parseLLMResponse(content);
    } catch (error) {
      console.error('OpenAI Vision API error:', error);
      // Fallback to basic analysis
      return {
        visualDescription: 'Image analysis unavailable',
        detectedElements: [],
        similaritySignals: [],
        brandReferences: [],
        styleIndicators: [],
        characterLikeness: [],
        commercialContext: [],
      };
    }
  }

  private parseLLMResponse(content: string): LLMInsight {
    // Simple parsing - extract information from the text response
    // In production, you might want to use structured output or better parsing
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    
    return {
      visualDescription: this.extractSection(content, 'description', 'visual') || 'Generated image with various visual elements',
      detectedElements: this.extractList(content, 'elements', 'detected') || [],
      similaritySignals: this.extractList(content, 'similarity', 'resemble') || [],
      brandReferences: this.extractList(content, 'brand', 'trademark', 'logo') || [],
      styleIndicators: this.extractList(content, 'style', 'aesthetic') || [],
      characterLikeness: this.extractList(content, 'character', 'human', 'likeness') || [],
      commercialContext: this.extractList(content, 'commercial', 'marketing', 'use') || [],
    };
  }

  private extractSection(text: string, ...keywords: string[]): string | null {
    const lowerText = text.toLowerCase();
    for (const keyword of keywords) {
      const index = lowerText.indexOf(keyword);
      if (index !== -1) {
        const start = index;
        const end = Math.min(start + 200, text.length);
        return text.substring(start, end).trim();
      }
    }
    return null;
  }

  private extractList(text: string, ...keywords: string[]): string[] {
    const lowerText = text.toLowerCase();
    const items: string[] = [];
    
    for (const keyword of keywords) {
      const index = lowerText.indexOf(keyword);
      if (index !== -1) {
        const section = text.substring(index, Math.min(index + 300, text.length));
        // Extract bullet points or list items
        const matches = section.match(/[-•*]\s*([^\n]+)/g);
        if (matches) {
          items.push(...matches.map(m => m.replace(/[-•*]\s*/, '').trim()));
        }
      }
    }
    
    return items.slice(0, 5); // Limit to 5 items per category
  }
}

