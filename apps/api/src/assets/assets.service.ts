import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetResponse, AnalysisRunResponse } from '@pixeltrace/shared-types';

@Injectable()
export class AssetsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {
    console.log('[AssetsService] Constructor called');
    console.log('[AssetsService] prisma:', this.prisma ? 'DEFINED' : 'UNDEFINED');
  }

  async getAsset(id: string): Promise<AssetResponse> {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with id ${id} not found`);
    }

    return {
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
      createdAt: asset.createdAt.toISOString(),
    };
  }

  async getLatestAnalysis(assetId: string): Promise<AnalysisRunResponse | null> {
    const analysisRun = await this.prisma.analysisRun.findFirst({
      where: { assetId },
      orderBy: { startedAt: 'desc' },
      include: {
        results: true,
      },
    });

    if (!analysisRun) {
      return null;
    }

    return {
      id: analysisRun.id,
      assetId: analysisRun.assetId,
      startedAt: analysisRun.startedAt.toISOString(),
      completedAt: analysisRun.completedAt?.toISOString() || null,
      overallScore: analysisRun.overallScore,
      riskTier: analysisRun.riskTier as any,
      status: analysisRun.status || 'PENDING',
      statusMessage: analysisRun.statusMessage || null,
      results: analysisRun.results.map((r) => ({
        id: r.id,
        category: r.category as any,
        score: r.score,
        confidence: r.confidence,
        explanation: r.explanation,
      })),
    };
  }
}


