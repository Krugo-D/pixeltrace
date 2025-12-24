import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { OpenAIVisionAdapter, RiskAggregator } from '@pixeltrace/risk-engine';
import { RiskCategory, RiskResult } from '@pixeltrace/shared-types';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AnalysisService {
  private visionAdapter: OpenAIVisionAdapter;
  private aggregator = new RiskAggregator();

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {
    // Initialize OpenAI adapter with API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.visionAdapter = new OpenAIVisionAdapter(apiKey);
    } else {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
  }

  async analyzeAsset(assetId: string): Promise<string> {
    // Get asset
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }

    // Create analysis run
    const analysisRun = await this.prisma.analysisRun.create({
      data: {
        assetId,
      },
    });

    // Run analysis asynchronously
    this.runAnalysis(analysisRun.id, asset).catch((error) => {
      console.error('Analysis failed:', error);
    });

    return analysisRun.id;
  }

  private async runAnalysis(analysisRunId: string, asset: any) {
    try {
      // Get image file path
      const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, asset.filePath);

      // Convert file to base64 data URL for OpenAI
      const fileBuffer = await fs.readFile(filePath);
      const base64 = fileBuffer.toString('base64');
      const mimeType = asset.mimeType;
      const dataUrl = `data:${mimeType};base64,${base64}`;

      // Get risk scores directly from OpenAI
      const scores = await this.visionAdapter.analyzeImageScores(dataUrl);

      // Convert scores to RiskResult format
      const results: RiskResult[] = [
        {
          category: RiskCategory.VISUAL_SIMILARITY,
          score: Math.round(scores.visualSimilarity.score),
          confidence: Math.round(scores.visualSimilarity.confidence * 100) / 100,
          explanation: '',
        },
        {
          category: RiskCategory.TRADEMARK,
          score: Math.round(scores.trademark.score),
          confidence: Math.round(scores.trademark.confidence * 100) / 100,
          explanation: '',
        },
        {
          category: RiskCategory.COPYRIGHT,
          score: Math.round(scores.copyright.score),
          confidence: Math.round(scores.copyright.confidence * 100) / 100,
          explanation: '',
        },
        {
          category: RiskCategory.CHARACTER,
          score: Math.round(scores.character.score),
          confidence: Math.round(scores.character.confidence * 100) / 100,
          explanation: '',
        },
        {
          category: RiskCategory.TRAINING_DATA,
          score: Math.round(scores.trainingData.score),
          confidence: Math.round(scores.trainingData.confidence * 100) / 100,
          explanation: '',
        },
        {
          category: RiskCategory.COMMERCIAL_USAGE,
          score: Math.round(scores.commercialUsage.score),
          confidence: Math.round(scores.commercialUsage.confidence * 100) / 100,
          explanation: '',
        },
      ];

      // Aggregate results
      const aggregated = this.aggregator.aggregate(results);

      // Save results to database
      await this.prisma.analysisRun.update({
        where: { id: analysisRunId },
        data: {
          completedAt: new Date(),
          overallScore: aggregated.overallScore,
          riskTier: aggregated.riskTier,
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
    } catch (error) {
      console.error('Analysis error:', error);
      // Mark analysis as failed (could add error tracking)
    }
  }
}

