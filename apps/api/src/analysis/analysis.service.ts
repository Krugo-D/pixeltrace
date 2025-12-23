import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
  OpenAIVisionAdapter,
  VisualSimilarityAnalyzer,
  TrademarkAnalyzer,
  CopyrightAnalyzer,
  CharacterAnalyzer,
  TrainingDataAnalyzer,
  CommercialUsageAnalyzer,
  RiskAggregator,
} from '@pixeltrace/risk-engine';
import { RiskCategory } from '@pixeltrace/shared-types';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AnalysisService {
  private visionAdapter: OpenAIVisionAdapter;
  private analyzers = [
    new VisualSimilarityAnalyzer(),
    new TrademarkAnalyzer(),
    new CopyrightAnalyzer(),
    new CharacterAnalyzer(),
    new TrainingDataAnalyzer(),
    new CommercialUsageAnalyzer(),
  ];
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

      // Get LLM insight
      const insight = await this.visionAdapter.analyzeImage(dataUrl);

      // Run all analyzers
      const results = await Promise.all(
        this.analyzers.map((analyzer) => analyzer.analyze(insight))
      );

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

