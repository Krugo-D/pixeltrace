import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AssetsModule } from '../assets/assets.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AssetsModule, StorageModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}

