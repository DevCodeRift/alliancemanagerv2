# Vercel Deployment Guide

## 📋 Pre-deployment Checklist

### 1. Neon Database Setup
- [ ] Create account at [Neon Console](https://console.neon.tech/)
- [ ] Create new project/database
- [ ] Copy connection string (starts with `postgresql://`)
- [ ] Test connection locally

### 2. Discord Application Setup
- [ ] Create app at [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Configure OAuth2 redirect URIs:
  - Development: `http://localhost:5173/api/auth/callback/discord`
  - Production: `https://your-app.vercel.app/api/auth/callback/discord`
- [ ] Copy Client ID and Client Secret

### 3. Politics and War API
- [ ] Get API key from [Politics and War Account](https://politicsandwar.com/account/)

## 🚀 Vercel Deployment Steps

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select framework preset: **Vite**

### 2. Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add each variable individually:

**Variable Name**: `DATABASE_URL`
**Value**: `postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/alliancemanager?sslmode=require`
**Environment**: Production, Preview, Development

**Variable Name**: `NEXTAUTH_SECRET`  
**Value**: `your-random-secret-here` (generate with: `openssl rand -base64 32`)
**Environment**: Production, Preview, Development

**Variable Name**: `NEXTAUTH_URL`
**Value**: `https://your-app.vercel.app`
**Environment**: Production, Preview

**Variable Name**: `DISCORD_CLIENT_ID`
**Value**: `your-discord-client-id`
**Environment**: Production, Preview, Development

**Variable Name**: `DISCORD_CLIENT_SECRET`
**Value**: `your-discord-client-secret` 
**Environment**: Production, Preview, Development

> 💡 **Important**: Add each variable individually in the Vercel dashboard, don't copy-paste the block format.

### 3. Build Settings
Vercel should auto-detect these, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test your deployment

## 🔧 Post-Deployment

### 1. Database Migration
After first deployment, run database migration:

```bash
# In your local terminal
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
```

### 2. Update Discord Redirect URI
Add your production URL to Discord OAuth settings:
- `https://your-app.vercel.app/api/auth/callback/discord`

### 3. Test Authentication
- Visit your deployed app
- Test Discord login
- Test username/password registration
- Test PnW account verification

## 🔄 Continuous Deployment

Every push to `main` branch will automatically deploy to Vercel.

For staging/preview deployments:
1. Create feature branch
2. Push to GitHub
3. Vercel automatically creates preview deployment
4. Test preview before merging to main

## 🛠️ Troubleshooting

### Common Issues:

**Build Fails**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

**Database Connection Fails**
- Verify `DATABASE_URL` format
- Check Neon database is running
- Ensure SSL mode is required

**Authentication Issues**
- Verify `NEXTAUTH_URL` matches deployment URL
- Check Discord redirect URIs
- Ensure `NEXTAUTH_SECRET` is set

**API Routes Not Working**
- Check `vercel.json` configuration
- Verify file paths match function routes
- Check server logs in Vercel dashboard

## 📊 Monitoring

Monitor your deployment:
- **Vercel Dashboard**: Build logs, function logs
- **Neon Console**: Database performance, connections
- **Discord Developer Portal**: OAuth usage stats
