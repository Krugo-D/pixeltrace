import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly uploadDir = process.env.UPLOAD_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), 'uploads');

  async onModuleInit() {
    // Ensure upload directory exists
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async saveFile(file: Express.Multer.File, filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }

  getFileUrl(filename: string): string {
    // For POC, return a local file path that can be converted to URL
    // In production, this would return S3/GCS URL
    return `file://${path.join(this.uploadDir, filename)}`;
  }

  getPublicUrl(filename: string): string {
    // For POC, return a path that frontend can access
    // In production, this would be a CDN URL
    return `/api/files/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore
    }
  }
}

