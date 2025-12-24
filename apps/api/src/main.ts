import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  // Support multiple origins (comma-separated) or single origin
  const frontendUrls = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3000'];
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (frontendUrls.some(url => origin.startsWith(url))) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for POC - tighten in production
      }
    },
    credentials: true,
  });

  // Per project rules: Backend MUST run on localhost:4000 (BACKEND_PORT=4000)
  const port = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 4000;
  await app.listen(port);
  console.log(`API server running on http://localhost:${port}`);
}

bootstrap();

