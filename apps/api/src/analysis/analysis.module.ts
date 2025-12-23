import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [AssetsModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}

