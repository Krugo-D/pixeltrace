# Railway Deployment Guide

This guide will help you deploy PixelTrace to Railway with separate services for the backend, frontend, and PostgreSQL database.

## Prerequisites

- Railway account (sign up at [railway.app](https://railway.app))
- GitHub repository with your code (or use Railway's GitHub integration)

## Deployment Steps

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and create a new project
2. Choose "Deploy from GitHub repo" if you have your code on GitHub, or "Empty Project" to deploy manually

### 2. Add PostgreSQL Database

1. In your Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically create a database and provide a `DATABASE_URL` environment variable
3. Note: Railway automatically sets `DATABASE_URL` - you don't need to configure it manually

### 3. Deploy Backend API

1. Click "New" → "GitHub Repo" (or "Empty Service" if deploying manually)
2. Select your repository
3. Railway will detect it's a Node.js project
4. Configure the service:
   - **Root Directory**: Leave empty (or set to project root)
   - **Build Command**: `yarn install && yarn workspace api prisma:generate && yarn workspace api build`
   - **Start Command**: `yarn workspace api start`
5. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key (already in .env)
   - `PORT`: `3001` (Railway will override with `$PORT` automatically)
   - `UPLOAD_DIR`: `./uploads` (or use Railway's volume storage)
   - `FRONTEND_URL`: Will be set after frontend is deployed (see step 4)
   - `DATABASE_URL`: Automatically provided by Railway from the PostgreSQL service
6. Generate a public domain for the API service (click "Settings" → "Generate Domain")
7. Copy the generated domain URL (e.g., `https://your-api.up.railway.app`)

### 4. Deploy Frontend

1. Click "New" → "GitHub Repo" (or "Empty Service")
2. Select the same repository
3. Configure the service:
   - **Root Directory**: Leave empty
   - **Build Command**: `yarn install && yarn workspace web build`
   - **Start Command**: `yarn workspace web start`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: The backend API URL from step 3 (e.g., `https://your-api.up.railway.app`)
5. Generate a public domain for the frontend service
6. Copy the frontend domain URL

### 5. Update Backend CORS

1. Go back to your backend service settings
2. Update `FRONTEND_URL` environment variable with the frontend domain URL from step 4
3. Redeploy the backend service

### 6. Run Database Migrations

1. In the backend service, go to "Settings" → "Variables"
2. Add a one-time deployment script or use Railway's CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run yarn workspace api prisma:migrate:deploy
```

Alternatively, you can add a post-deploy script or run migrations manually in Railway's service shell.

### 7. File Storage (Optional)

For production, consider using Railway's volume storage or switch to S3/GCS:

1. **Railway Volumes**: Add a volume in your backend service settings
2. **S3/GCS**: Update `StorageService` to use cloud storage (recommended for production)

## Environment Variables Summary

### Backend Service
- `DATABASE_URL` - Auto-provided by Railway PostgreSQL service
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Railway sets this automatically (use `process.env.PORT`)
- `UPLOAD_DIR` - `./uploads` or volume path
- `FRONTEND_URL` - Your frontend Railway domain

### Frontend Service
- `NEXT_PUBLIC_API_URL` - Your backend Railway domain

## Railway-Specific Considerations

1. **Port Binding**: Railway sets `PORT` automatically. The code already uses `process.env.PORT || 3001`
2. **Database Migrations**: Run migrations on first deploy using Railway CLI or service shell
3. **File Storage**: For production, use Railway volumes or cloud storage (S3/GCS)
4. **Build Time**: Railway will install all dependencies. The monorepo structure is supported.
5. **CORS**: Backend CORS is configured to accept requests from the frontend domain

## Troubleshooting

### Backend won't start
- Check that `DATABASE_URL` is set (should be automatic)
- Verify `OPENAI_API_KEY` is set
- Check build logs for TypeScript errors

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend CORS settings include frontend domain
- Ensure backend service is running and has a public domain

### Database connection errors
- Verify `DATABASE_URL` is set in backend service
- Check that PostgreSQL service is running
- Run migrations: `railway run yarn workspace api prisma:migrate:deploy`

### Build failures
- Ensure all workspace dependencies are listed in root `package.json`
- Check that Prisma schema is in `apps/api/prisma/schema.prisma`
- Verify build commands are correct in Railway service settings

## Production Recommendations

1. **Use Railway Volumes** for file storage instead of local filesystem
2. **Set up monitoring** using Railway's built-in metrics
3. **Configure custom domains** for both services
4. **Enable Railway's auto-deploy** from your main branch
5. **Set up environment-specific variables** (staging vs production)
6. **Implement rate limiting** for OpenAI API calls
7. **Add error tracking** (Sentry, etc.)
8. **Set up scheduled cleanup** for uploaded files

## Cost Estimation

Railway pricing:
- **PostgreSQL**: ~$5/month for starter plan
- **Backend Service**: Pay-as-you-go (typically $5-20/month for low traffic)
- **Frontend Service**: Pay-as-you-go (typically $5-20/month for low traffic)

Total: ~$15-45/month for a POC/low-traffic deployment

