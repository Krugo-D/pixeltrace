import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UploadsModule } from './uploads/uploads.module';
import { AssetsModule } from './assets/assets.module';
import { AnalysisModule } from './analysis/analysis.module';
import { StorageModule } from './storage/storage.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    UploadsModule,
    AssetsModule,
    AnalysisModule,
    FilesModule,
  ],
})
export class AppModule {}

