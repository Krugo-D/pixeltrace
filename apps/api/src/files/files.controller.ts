import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from '../storage/storage.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller('files')
export class FilesController {
  constructor(private storage: StorageService) {}

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, filename);

    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch {
      throw new NotFoundException('File not found');
    }
  }
}

