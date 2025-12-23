# PixelTrace - AI IP Risk Scanner (POC)

A proof-of-concept SaaS application for enterprise brands to assess IP and commercial risk in AI-generated images and videos.

## ⚠️ Important Disclaimer

This is a **proof-of-concept** tool. The risk assessments provided are **indicative only** and should not be considered legal advice. Results are based on automated analysis and may not capture all relevant factors. For commercial use, especially in high-visibility campaigns, consult with legal counsel familiar with IP law in your jurisdiction.

## Architecture

This is a monorepo built with:

- **Frontend**: Next.js 14 (App Router) with TypeScript and Tailwind CSS
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: Local filesystem (abstracted for future S3/GCS migration)
- **AI Analysis**: OpenAI Vision API (gpt-4o-mini)

### Monorepo Structure

```
pixeltrace/
├── apps/
│   ├── web/              # Next.js frontend
│   └── api/              # NestJS backend
│       └── prisma/
│           └── schema.prisma # Database schema
├── packages/
│   ├── shared-types/     # Shared TypeScript types and DTOs
│   └── risk-engine/      # Pluggable risk analysis engine
└── package.json          # Root workspace configuration
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL database
- OpenAI API key

### 1. Install Dependencies

```bash
yarn install
```

### 2. Database Setup

Create a `.env` file in `apps/api/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pixeltrace"
OPENAI_API_KEY="your-openai-api-key"
PORT=3001
UPLOAD_DIR="./uploads"
FRONTEND_URL="http://localhost:3000"
```

**Note**: The OpenAI API key provided is for the free tier. Be mindful of rate limits.

Generate Prisma client and run migrations:

```bash
cd apps/api
yarn prisma:generate
yarn prisma:migrate
```

### 3. Start Development Servers

In separate terminals:

**Terminal 1 - Backend:**
```bash
yarn dev:api
```

**Terminal 2 - Frontend:**
```bash
yarn dev:web
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## How It Works

1. **Upload**: User uploads an image via drag-and-drop or file picker
2. **Storage**: Image is saved to local filesystem and metadata stored in database
3. **Analysis**: Backend triggers asynchronous analysis:
   - Image is sent to OpenAI Vision API for visual analysis
   - Six risk analyzers process the LLM insights:
     - Visual Similarity Risk
     - Trademark / Brand Confusion Risk
     - Copyright Style Mimicry Risk
     - Character / Celebrity Likeness Risk
     - Training Data Ambiguity Risk
     - Commercial Usage Risk
   - Results are aggregated into overall score and risk tier
4. **Results**: Frontend polls for completion and displays risk assessment

## Risk Engine Architecture

The risk engine is designed to be modular and pluggable:

### Vision LLM Adapters

Located in `packages/risk-engine/src/adapters/`:

- `VisionLLMAdapter` - Interface for vision analysis
- `MockVisionLLMAdapter` - Mock implementation for testing
- `OpenAIVisionAdapter` - OpenAI Vision API implementation

### Risk Analyzers

Located in `packages/risk-engine/src/analyzers/`:

Each analyzer implements the `RiskAnalyzer` interface and processes LLM insights to produce:
- Risk score (0-100)
- Confidence level (0-1)
- Plain-English explanation

### Adding a New Risk Analyzer

1. Create a new analyzer class in `packages/risk-engine/src/analyzers/`:

```typescript
import { RiskAnalyzer } from './analyzer.interface';
import { RiskResult, RiskCategory, LLMInsight } from '@pixeltrace/shared-types';

export class MyNewAnalyzer implements RiskAnalyzer {
  category = RiskCategory.YOUR_CATEGORY;

  async analyze(insight: LLMInsight): Promise<RiskResult> {
    // Your analysis logic here
    return {
      category: this.category,
      score: 0-100,
      confidence: 0-1,
      explanation: 'Your explanation',
    };
  }
}
```

2. Add the category to `packages/shared-types/src/types/risk.ts`
3. Register the analyzer in `apps/api/src/analysis/analysis.service.ts`
4. Update the aggregator weights if needed

### Replacing the Vision LLM Provider

The `VisionLLMAdapter` interface allows swapping providers:

1. Create a new adapter implementing `VisionLLMAdapter`:

```typescript
import { VisionLLMAdapter, LLMInsight } from '@pixeltrace/shared-types';

export class GoogleGeminiAdapter implements VisionLLMAdapter {
  async analyzeImage(imageUrl: string): Promise<LLMInsight> {
    // Your implementation
  }
}
```

2. Update `apps/api/src/analysis/analysis.service.ts` to use your adapter

## API Endpoints

- `POST /uploads` - Upload an image (multipart/form-data)
- `GET /assets/:id` - Get asset metadata
- `GET /assets/:id/analysis` - Get latest analysis results

## Database Schema

- **Asset**: Stores uploaded file metadata
- **AnalysisRun**: Tracks analysis execution (supports multiple runs per asset)
- **RiskResult**: Stores individual risk category results

## Production Considerations

This POC is designed for local development. For production:

1. **File Storage**: Replace local filesystem with S3/GCS
2. **Job Queue**: Use Bull/BullMQ for async analysis processing
3. **Rate Limiting**: Implement rate limiting for OpenAI API calls
4. **Error Handling**: Add comprehensive error tracking (Sentry, etc.)
5. **Authentication**: Add user authentication and authorization
6. **Image Cleanup**: Implement scheduled deletion of uploaded images
7. **Caching**: Add Redis for analysis result caching
8. **Monitoring**: Add application monitoring and logging

## Railway Deployment

This application can be deployed to Railway with separate services for backend, frontend, and database. See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

Quick setup:
1. Create Railway project
2. Add PostgreSQL database service
3. Deploy backend service (configure build/start commands)
4. Deploy frontend service (set `NEXT_PUBLIC_API_URL`)
5. Run database migrations
6. Update backend `FRONTEND_URL` for CORS

## License

This is a proof-of-concept. Use at your own risk.

