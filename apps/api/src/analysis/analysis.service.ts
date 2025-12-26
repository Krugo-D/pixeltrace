import { Inject, Injectable } from '@nestjs/common';
import {
    GoogleVisionAdapter,
    MockVisionLLMAdapter,
    RiskAggregator,
    VisionLLMAdapter,
} from '@pixeltrace/risk-engine';
import { RiskCategory, RiskResult } from '@pixeltrace/shared-types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class AnalysisService {
  private visionAdapter: VisionLLMAdapter | null = null;
  private aggregator = new RiskAggregator();

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(StorageService) private storage: StorageService,
  ) {
    console.log('[AnalysisService] Constructor called');
    console.log('[AnalysisService] prisma:', this.prisma ? 'DEFINED' : 'UNDEFINED');
    console.log('[AnalysisService] storage:', this.storage ? 'DEFINED' : 'UNDEFINED');
    
    // Initialize vision adapter based on VISION_PROVIDER env var
    const provider = process.env.VISION_PROVIDER || 'google';
    console.log('[AnalysisService] Using vision provider:', provider);

    try {
      switch (provider.toLowerCase()) {
        case 'google':
          const googleKey = process.env.GOOGLE_VISION_API_KEY;
          if (!googleKey) {
            console.error('[AnalysisService] WARNING: GOOGLE_VISION_API_KEY not set');
            break;
          }
          this.visionAdapter = new GoogleVisionAdapter(googleKey);
          console.log('[AnalysisService] Google Vision adapter initialized');
          break;

        case 'mock':
          this.visionAdapter = new MockVisionLLMAdapter();
          console.log('[AnalysisService] Mock adapter initialized (for testing)');
          break;

        default:
          console.error('[AnalysisService] Unknown provider:', provider);
      }
    } catch (error) {
      console.error('[AnalysisService] Failed to initialize vision adapter:', error);
    }
  }

  async analyzeAsset(assetId: string): Promise<string> {
    console.log('[AnalysisService] analyzeAsset called for asset:', assetId);
    if (!this.visionAdapter) {
      console.error('[AnalysisService] Cannot analyze asset: OpenAI adapter not initialized. Check OPENAI_API_KEY.');
      throw new Error('Analysis service not properly initialized');
    }

    // Get asset
    console.log('[AnalysisService] Fetching asset from database...');
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      console.error('[AnalysisService] Asset not found:', assetId);
      throw new Error(`Asset ${assetId} not found`);
    }
    console.log('[AnalysisService] Asset found:', asset.id, asset.filename);

    // Create analysis run
    console.log('[AnalysisService] Creating analysis run...');
    const analysisRun = await this.prisma.analysisRun.create({
      data: {
        assetId,
        status: 'PENDING',
        statusMessage: 'Analysis queued...',
      },
    });
    console.log('[AnalysisService] Analysis run created:', analysisRun.id);

    // Run analysis asynchronously
    console.log('[AnalysisService] Starting async analysis...');
    this.runAnalysis(analysisRun.id, asset).catch((error) => {
      console.error('[AnalysisService] Analysis failed:', error);
      console.error('[AnalysisService] Error stack:', error instanceof Error ? error.stack : 'No stack');
    });

    return analysisRun.id;
  }

  private async updateStatus(analysisRunId: string, status: string, message: string | null = null) {
    await this.prisma.analysisRun.update({
      where: { id: analysisRunId },
      data: { status, statusMessage: message },
    });
    console.log(`[AnalysisService] Status updated: ${status} - ${message || ''}`);
  }

  private async runAnalysis(analysisRunId: string, asset: any) {
    console.log('[AnalysisService] runAnalysis started for run:', analysisRunId);
    if (!this.visionAdapter) {
      console.error('[AnalysisService] Cannot run analysis: Vision adapter not initialized');
      await this.updateStatus(analysisRunId, 'FAILED', 'Vision adapter not initialized');
      return;
    }

    try {
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Stage 1: Reading file
      await this.updateStatus(analysisRunId, 'READING_FILE', 'Ingesting visual data...');
      await sleep(800); // Give UI time to catch up
      
      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, asset.filePath);
      const fileBuffer = await fs.readFile(filePath);
      const dataUrl = `data:${asset.mimeType};base64,${fileBuffer.toString('base64')}`;
      
      // Stage 2: Calling vision API
      await this.updateStatus(analysisRunId, 'ANALYZING', 'Scanning global IP footprint...');
      console.log('[AnalysisService] Calling vision API analyzeImageScores...');

      // Get risk scores from vision API
      const scores = await this.visionAdapter.analyzeImageScores(dataUrl);
      
      // Stage 3: Processing results
      await this.updateStatus(analysisRunId, 'PROCESSING', 'Computing risk vectors...');
      await sleep(800);

      // Validate scores
      const validateScore = (score: number, name: string): number => {
        if (isNaN(score) || score < 0 || score > 100) {
          console.warn(`Invalid ${name} score: ${score}, defaulting to 0`);
          return 0;
        }
        return Math.round(score);
      };

      const validateConfidence = (confidence: number, name: string): number => {
        if (isNaN(confidence) || confidence < 0 || confidence > 1) {
          console.warn(`Invalid ${name} confidence: ${confidence}, defaulting to 0.5`);
          return 0.5;
        }
        return Math.round(confidence * 100) / 100;
      };

      // Convert scores to RiskResult format
      const results: RiskResult[] = [
        {
          category: RiskCategory.VISUAL_SIMILARITY,
          score: validateScore(scores.visualSimilarity.score, 'visualSimilarity'),
          confidence: validateConfidence(scores.visualSimilarity.confidence, 'visualSimilarity'),
          explanation: '',
        },
        {
          category: RiskCategory.TRADEMARK,
          score: validateScore(scores.trademark.score, 'trademark'),
          confidence: validateConfidence(scores.trademark.confidence, 'trademark'),
          explanation: '',
        },
        {
          category: RiskCategory.COPYRIGHT,
          score: validateScore(scores.copyright.score, 'copyright'),
          confidence: validateConfidence(scores.copyright.confidence, 'copyright'),
          explanation: '',
        },
        {
          category: RiskCategory.CHARACTER,
          score: validateScore(scores.character.score, 'character'),
          confidence: validateConfidence(scores.character.confidence, 'character'),
          explanation: '',
        },
        {
          category: RiskCategory.TRAINING_DATA,
          score: validateScore(scores.trainingData.score, 'trainingData'),
          confidence: validateConfidence(scores.trainingData.confidence, 'trainingData'),
          explanation: '',
        },
        {
          category: RiskCategory.COMMERCIAL_USAGE,
          score: validateScore(scores.commercialUsage.score, 'commercialUsage'),
          confidence: validateConfidence(scores.commercialUsage.confidence, 'commercialUsage'),
          explanation: '',
        },
      ];

      // Aggregate results
      const aggregated = this.aggregator.aggregate(results);

      // Stage 4: Saving results
      await this.updateStatus(analysisRunId, 'SAVING', 'Saving analysis results...');

      // Save results to database
      await this.prisma.analysisRun.update({
        where: { id: analysisRunId },
        data: {
          completedAt: new Date(),
          overallScore: aggregated.overallScore,
          riskTier: aggregated.riskTier,
          status: 'COMPLETED',
          statusMessage: 'Analysis completed successfully',
          results: {
            create: aggregated.results.map((r) => ({
              category: r.category,
              score: r.score,
              confidence: r.confidence,
              explanation: r.explanation,
            })),
          },
        },
      });
      
      console.log('[AnalysisService] Analysis completed successfully for run:', analysisRunId);
    } catch (error) {
      console.error('[AnalysisService] Analysis error:', error);
      console.error('[AnalysisService] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('[AnalysisService] Analysis run ID:', analysisRunId);
      console.error('[AnalysisService] Asset ID:', asset?.id);
      
      // Mark analysis as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await this.updateStatus(analysisRunId, 'FAILED', `Analysis failed: ${errorMessage}`);
    }
  }
}

