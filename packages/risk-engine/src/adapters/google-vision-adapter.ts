import { ImageAnnotatorClient } from '@google-cloud/vision';
import { LLMInsight, RiskScores, VisionLLMAdapter } from '@pixeltrace/shared-types';

export class GoogleVisionAdapter implements VisionLLMAdapter {
  private visionClient: ImageAnnotatorClient;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.visionClient = new ImageAnnotatorClient({
      apiKey: apiKey,
    });
  }

  async analyzeImage(imageUrl: string): Promise<LLMInsight> {
    return {
      visualDescription: 'Analysis performed via Google Cloud Vision + Gemini Reasoning',
      detectedElements: [],
      similaritySignals: [],
      brandReferences: [],
      styleIndicators: [],
      characterLikeness: [],
      commercialContext: [],
    };
  }

  async analyzeImageScores(imageUrl: string): Promise<RiskScores> {
    try {
      // Step 1: Get Objective Evidence from Google Vision API
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');

      console.log('[GoogleVision] Requesting labels, web detection, and logos...');
      const [visionResult] = await this.visionClient.annotateImage({
        image: { content: imageBuffer },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'WEB_DETECTION', maxResults: 20 },
          { type: 'LOGO_DETECTION', maxResults: 10 },
        ],
      });

      const visionDataSummary = {
        labels: visionResult.labelAnnotations?.map(l => l.description),
        logos: visionResult.logoAnnotations?.map(l => l.description),
        webEntities: visionResult.webDetection?.webEntities?.map(e => e.description),
        visuallySimilarImagesCount: visionResult.webDetection?.visuallySimilarImages?.length || 0,
        fullMatchingImagesCount: visionResult.webDetection?.fullMatchingImages?.length || 0,
        partialMatchingImagesCount: visionResult.webDetection?.partialMatchingImages?.length || 0,
      };

      console.log('[GoogleVision] Evidence gathered. Passing to Gemini for reasoning...');

      // Step 2: Use Gemini to reason about the Vision findings
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert Intellectual Property (IP) Risk Assessment AI. 
                Analyze the following raw computer vision data from Google Vision API and determine risk scores for a generated image.
                
                Vision Evidence:
                ${JSON.stringify(visionDataSummary, null, 2)}
                
                Scoring Guidelines (0-100):
                - 0-30: Low Risk (Unique content, generic elements, no specific IP matches)
                - 31-60: Medium Risk (Strong stylistic resemblance, generic similarity to known brands/characters)
                - 61-100: High Risk (Clear detection of copyrighted characters, trademarks, logos, or exact web matches)
                
                Strict Calibration Rules:
                - If exact web matches (fullMatchingImagesCount > 0) are found, visualSimilarity must be between 90-95.
                - If no brand logos are detected in 'logos', trademark must be 0 (ignore stylistic similarities for trademark).
                - Copyright risk should be calibrated: if web matches are found but it's fan art or derivative, score it around 65-75.
                
                Provide a score, a confidence level (0-1), and a brief professional explanation for each category.
                
                Categories to score:
                1. visualSimilarity: Risk of being visually identical or substantially similar to existing works.
                2. trademark: Risk of infringing on logos, brand names, or protected marks.
                3. copyright: Risk of infringing on specific protected designs or artistic works.
                4. character: Risk of likeness to recognizable fictional characters or public figures.
                5. trainingData: Estimated risk that the image is a direct memorization of protected training data (use web matching as a proxy).
                6. commercialUsage: Overall risk for using this image in a high-stakes commercial campaign.
                
                Return ONLY valid JSON in this exact format:
                {
                  "visualSimilarity": { "score": number, "confidence": number, "explanation": "string" },
                  "trademark": { "score": number, "confidence": number, "explanation": "string" },
                  "copyright": { "score": number, "confidence": number, "explanation": "string" },
                  "character": { "score": number, "confidence": number, "explanation": "string" },
                  "trainingData": { "score": number, "confidence": number, "explanation": "string" },
                  "commercialUsage": { "score": number, "confidence": number, "explanation": "string" },
                  "legalAdvice": "A brief summary of risk and usage advice"
                }`
              }]
            }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
      }

      const geminiData = (await geminiResponse.json()) as any;
      const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(content);
      console.log('[Google+Gemini] Analysis complete. Commercial advice:', parsed.legalAdvice);

      return {
        visualSimilarity: parsed.visualSimilarity,
        trademark: parsed.trademark,
        copyright: parsed.copyright,
        character: parsed.character,
        trainingData: parsed.trainingData,
        commercialUsage: parsed.commercialUsage,
      };
    } catch (error) {
      console.error('[GoogleVisionAdapter] Combined Analysis Error:', error);
      throw error;
    }
  }
}
