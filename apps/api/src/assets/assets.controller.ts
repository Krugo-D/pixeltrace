import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(@Inject(AssetsService) private readonly assetsService: AssetsService) {
    console.log('[AssetsController] Constructor called');
    console.log('[AssetsController] assetsService:', this.assetsService ? 'DEFINED' : 'UNDEFINED');
    
    if (!this.assetsService) {
      console.error('[AssetsController] CRITICAL: assetsService is undefined in constructor!');
    }
  }

  @Get(':id')
  async getAsset(@Param('id') id: string) {
    return this.assetsService.getAsset(id);
  }

  @Get(':id/analysis')
  async getAnalysis(@Param('id') id: string) {
    try {
      const analysis = await this.assetsService.getLatestAnalysis(id);
      if (!analysis) {
        throw new NotFoundException(`No analysis found for asset ${id}`);
      }
      return analysis;
    } catch (error) {
      console.error('[AssetsController] Error fetching analysis for asset', id, ':', error);
      throw error;
    }
  }
}

