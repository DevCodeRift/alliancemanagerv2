# 🚀 Deployment Guide for www.alliancemanager.dev

## Discord OAuth Configuration

### Redirect URIs (Add both in Discord Developer Portal)
```
http://localhost:5173/api/auth/discord/callback
https://www.alliancemanager.dev/api/auth/discord/callback
```

### OAuth Scopes Required
- `identify` - Get user ID and username
- `email` - Get user's email address

## Environment Variables

### 🔧 Vercel Environment Variables

Set these in your Vercel dashboard (`Settings` → `Environment Variables`):

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require` | From Neon.tech |
| `NEXTAUTH_SECRET` | `your-production-secret-32-chars-min` | Generate new for production |
| `NEXTAUTH_URL` | `https://www.alliancemanager.dev` | Your production domain |
| `DISCORD_CLIENT_ID` | `your-18-digit-client-id` | From Discord Developer Portal |
| `DISCORD_CLIENT_SECRET` | `your-32-character-client-secret` | From Discord Developer Portal |
| `PNW_API_BASE_URL` | `https://api.politicsandwar.com/graphql` | PnW GraphQL endpoint |
| `NODE_ENV` | `production` | Environment indicator |

### 🔧 Local Development (.env file)

```bash
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/db?sslmode=require"

# Authentication (use different secret than production!)
NEXTAUTH_SECRET="your-development-secret-different-from-prod"
NEXTAUTH_URL="http://localhost:5173"

# Discord OAuth (same as production)
DISCORD_CLIENT_ID="your-18-digit-client-id"
DISCORD_CLIENT_SECRET="your-32-character-client-secret"

# Politics and War API
PNW_API_BASE_URL="https://api.politicsandwar.com/graphql"

# Environment
NODE_ENV="development"
```

## 📋 Deployment Checklist

### ✅ Discord Application Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application: "Alliance Manager v2"
3. Go to **OAuth2** → **General**
4. Add both redirect URIs (dev + prod)
5. Select scopes: `identify`, `email`
6. Copy Client ID and Client Secret

### ✅ Database Setup
1. Create database at [Neon.tech](https://console.neon.tech/)
2. Copy connection string
3. Run migrations: `npm run db:deploy`

### ✅ Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set all environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### ✅ Testing
1. **Local testing:**
   ```bash
   npm run check:discord  # Verify Discord config
   npm run dev:all        # Test locally
   ```

2. **Production testing:**
   - Visit https://www.alliancemanager.dev
   - Test Discord OAuth signup
   - Test username/password signup
   - Test PnW nation verification

## 🔒 Security Notes

- **Different secrets**: Use different `NEXTAUTH_SECRET` for dev/prod
- **HTTPS only**: Production OAuth only works with HTTPS
- **Environment isolation**: Keep dev and prod databases separate
- **Secret rotation**: Regularly rotate Discord Client Secret

## 🐛 Troubleshooting

### Discord OAuth Issues
- ❌ **"Invalid redirect URI"**: Check exact URL match in Discord app
- ❌ **"Invalid client"**: Verify Client ID is correct
- ❌ **"Access denied"**: Check Client Secret is correct

### Database Issues
- ❌ **Connection failed**: Verify DATABASE_URL format
- ❌ **Table not found**: Run `npm run db:deploy`

### CORS Issues
- ❌ **CORS blocked**: Verify NEXTAUTH_URL matches domain

## 📞 Support

If you encounter issues:
1. Run `npm run check:discord` to verify configuration
2. Check Vercel function logs for API errors
3. Test locally first with `npm run dev:all`

---

**🎯 Once configured, both Discord OAuth and username/password authentication will work seamlessly on www.alliancemanager.dev!**
