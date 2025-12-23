# Railway Monorepo Setup Guide

## Problem
Railway is trying to build the entire monorepo as one service. We need **two separate services** (api and web) that both deploy from the same GitHub repo.

## Solution: Create Separate Services

### Step 1: Delete Current Service
1. In Railway, delete the current "pixeltrace" service (if it exists)
2. Keep the PostgreSQL database service

### Step 2: Create API Service
1. Click **"New"** → **"GitHub Repo"**
2. Select **"Krugo-D/pixeltrace"** repository
3. Railway will create a new service
4. **Rename it to "api"** (click the service name to edit)

**Configure Settings:**
- **Root Directory**: Leave empty (`.` - uses repo root)
- **Build Command**: (leave empty - nixpacks.toml will handle it)
- **Start Command**: `yarn workspace api start`

**Environment Variables:**
- `OPENAI_API_KEY` = `your-openai-api-key-here`
- `UPLOAD_DIR` = `./uploads`
- `FRONTEND_URL` = (leave empty for now)
- `DATABASE_URL` = (automatically provided by Railway PostgreSQL)

**Generate Domain:**
- Settings → Generate Domain (copy the URL)

### Step 3: Create Web Service
1. Click **"New"** → **"GitHub Repo"** (again)
2. Select **"Krugo-D/pixeltrace"** (same repo)
3. Railway will create another service
4. **Rename it to "web"**

**Configure Settings:**
- **Root Directory**: Leave empty (`.` - uses repo root)
- **Build Command**: (leave empty - nixpacks.toml will handle it)
- **Start Command**: `yarn workspace web start`

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` = (the API domain URL from Step 2, e.g., `https://api-production.up.railway.app`)

**Generate Domain:**
- Settings → Generate Domain (copy the URL)

### Step 4: Update API Service with Frontend URL
1. Go back to **"api"** service
2. Add/Update environment variable:
   - `FRONTEND_URL` = (the web service domain URL from Step 3)
3. This will trigger a redeploy

### Step 5: Run Database Migrations
After the API service is deployed, run migrations:

**Option A: Using Railway CLI**
```bash
railway link  # Link to your project
railway service api  # Select the api service
railway run yarn workspace api prisma:migrate:deploy
```

**Option B: Using Railway Dashboard**
1. Go to API service
2. Click "Deployments" → "View Logs"
3. Click "Shell" tab
4. Run: `yarn workspace api prisma:migrate:deploy`

## How It Works

- Both services deploy from the **same GitHub repo** (`Krugo-D/pixeltrace`)
- Each service uses its own `nixpacks.toml` file in `apps/api/` and `apps/web/`
- The `nixpacks.toml` files specify:
  - Install yarn
  - Run `yarn install` (installs all workspace dependencies)
  - Run workspace-specific build commands
  - Start the correct workspace service

## Troubleshooting

**If build fails with "yarn: not found":**
- Make sure `nixpacks.toml` includes `yarn` in `nixPkgs`
- Check that Railway is using Nixpacks (not Dockerfile)

**If services can't find each other:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly in web service
- Verify `FRONTEND_URL` is set correctly in api service
- Check that both services have generated domains

**If database connection fails:**
- Ensure PostgreSQL service is running
- Verify `DATABASE_URL` is automatically set (Railway does this)
- Check that migrations have been run

