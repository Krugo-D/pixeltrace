# Environment Setup

## Local Development

Create a `.env` file in `apps/api/` with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pixeltrace"
OPENAI_API_KEY="your-openai-api-key"
PORT=3001
UPLOAD_DIR="./uploads"
FRONTEND_URL="http://localhost:3000"
```

**Note**: The `.env` file is gitignored and should not be committed. The OpenAI API key is for the free tier - be mindful of rate limits.

## Railway Deployment

On Railway, set these environment variables in the service settings:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - Automatically provided by Railway PostgreSQL service
- `PORT` - Railway sets this automatically
- `UPLOAD_DIR` - `./uploads` or Railway volume path
- `FRONTEND_URL` - Your frontend Railway domain URL

See [RAILWAY_DEPLOYMENT.md](../../RAILWAY_DEPLOYMENT.md) for full deployment instructions.

