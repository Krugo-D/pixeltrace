import { config } from 'dotenv';
import { resolve } from 'path';
import 'reflect-metadata';
config({ path: resolve(__dirname, '../.env') });

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
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

  // Add global exception filter for better error logging
  @Catch()
  class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      
      console.error('Unhandled exception:', exception);
      console.error('Request URL:', request.url);
      console.error('Request method:', request.method);
      if (exception instanceof Error) {
        console.error('Error message:', exception.message);
        console.error('Stack trace:', exception.stack);
      }
      
      const status = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
      
      const message = exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
        ? exception.message
        : 'Internal server error';
      
      response.status(status).json({
        statusCode: status,
        message: typeof message === 'string' ? message : (message as any).message || 'Internal server error',
        error: exception instanceof Error ? exception.name : 'Error',
      });
    }
  }
  
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Per project rules: Backend MUST run on localhost:4000 (BACKEND_PORT=4000)
  // In production (Railway), use the PORT environment variable assigned by the platform
  const port = process.env.PORT || (process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : 4000);
  await app.listen(port);
  console.log(`API server running on port ${port}`);
}

bootstrap();

