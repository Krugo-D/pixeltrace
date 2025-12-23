import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(':id')
  async getAsset(@Param('id') id: string) {
    return this.assetsService.getAsset(id);
  }

  @Get(':id/analysis')
  async getAnalysis(@Param('id') id: string) {
    const analysis = await this.assetsService.getLatestAnalysis(id);
    if (!analysis) {
      throw new NotFoundException(`No analysis found for asset ${id}`);
    }
    return analysis;
  }
}

