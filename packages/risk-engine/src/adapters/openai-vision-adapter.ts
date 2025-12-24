import { VisionLLMAdapter, LLMInsight, RiskScores } from '@pixeltrace/shared-types';
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

  async analyzeImageScores(imageUrl: string): Promise<RiskScores> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image for IP and commercial risk. For each category, provide a score (0-100) and confidence (0-1).

Score 0-100 means:
- 0-30: Low risk (unique, abstract, no IP concerns)
- 31-60: Medium risk (some similarity or ambiguity)
- 61-100: High risk (clear IP infringement, copyrighted characters, trademarks)

Categories:
1. visualSimilarity: Risk of visual similarity to existing copyrighted works (NOT generic artistic styles - only specific copyrighted works)
2. trademark: Risk of trademark infringement (logos, brand marks, distinctive brand elements)
3. copyright: Risk of copyright infringement (specific copyrighted characters, designs, or distinctive works)
4. character: Risk of character likeness (recognizable characters, celebrities, or distinctive character designs)
5. trainingData: Risk related to training data sources (only if clearly derived from copyrighted training data)
6. commercialUsage: Overall commercial usage risk (aggregate of other factors)

Return ONLY valid JSON in this exact format:
{
  "visualSimilarity": { "score": 0-100, "confidence": 0-1 },
  "trademark": { "score": 0-100, "confidence": 0-1 },
  "copyright": { "score": 0-100, "confidence": 0-1 },
  "character": { "score": 0-100, "confidence": 0-1 },
  "trainingData": { "score": 0-100, "confidence": 0-1 },
  "commercialUsage": { "score": 0-100, "confidence": 0-1 }
}

Important: Only score high (60+) if there are ACTUAL IP risks like copyrighted characters, trademarks, or specific copyrighted works. Abstract art, generic styles, or unique AI-generated content should score low (0-30).`,
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
        response_format: { type: 'json_object' },
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      
      return {
        visualSimilarity: parsed.visualSimilarity || { score: 0, confidence: 0.5 },
        trademark: parsed.trademark || { score: 0, confidence: 0.5 },
        copyright: parsed.copyright || { score: 0, confidence: 0.5 },
        character: parsed.character || { score: 0, confidence: 0.5 },
        trainingData: parsed.trainingData || { score: 0, confidence: 0.5 },
        commercialUsage: parsed.commercialUsage || { score: 0, confidence: 0.5 },
      };
    } catch (error) {
      console.error('OpenAI Vision API error:', error);
      // Fallback to low-risk scores
      return {
        visualSimilarity: { score: 0, confidence: 0.3 },
        trademark: { score: 0, confidence: 0.3 },
        copyright: { score: 0, confidence: 0.3 },
        character: { score: 0, confidence: 0.3 },
        trainingData: { score: 0, confidence: 0.3 },
        commercialUsage: { score: 0, confidence: 0.3 },
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

