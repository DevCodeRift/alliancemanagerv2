# Development Configuration Guide

## Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment:**
   ```bash
   npm run setup
   ```

3. **Configure your .env file with:**
   - Neon PostgreSQL database URL
   - Discord OAuth credentials
   - Any other required environment variables

4. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start development servers:**
   ```bash
   npm run dev:all
   ```

## Available Scripts

- `npm run dev` - Start Vite development server (frontend only)
- `npm run server` - Start Express API server with hot reload
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build production frontend
- `npm run preview` - Preview production build
- `npm run setup` - Initialize environment configuration

## Database Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (destructive!)
- `npm run db:deploy` - Deploy migrations to production

## Environment Variables

Required environment variables in `.env`:

```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:5173"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Politics and War API
PNW_API_BASE_URL="https://api.politicsandwar.com/graphql"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/discord` - Discord OAuth initiation
- `POST /api/auth/discord/callback` - Discord OAuth callback
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/change-password` - Change password
- `GET /api/user/nation` - Get user's nation data

### Politics and War Integration
- `GET /api/pnw/nation/search` - Search for nations
- `POST /api/pnw/verify` - Verify nation with API key

### Utilities
- `GET /api/health` - Health check

## Frontend Structure

```
src/
├── components/          # React components
│   ├── AuthFlow.tsx    # Authentication flow management
│   ├── Login.tsx       # Login form
│   ├── Signup.tsx      # Registration form
│   └── Auth.css        # Cyberpunk styling
├── lib/                # Utility libraries
│   ├── auth.ts         # Authentication utilities
│   ├── db.ts           # Database client
│   └── pnw-api.ts      # PnW API client
└── server/             # Backend server
    ├── index.ts        # Main server file
    ├── middleware/     # Express middleware
    └── utils/          # Server utilities
```

## Deployment

### Frontend (Vercel)
- Push to GitHub
- Connect repository to Vercel
- Set environment variables in Vercel dashboard
- Deploy automatically on push

### Database (Neon)
- Create database at console.neon.tech
- Copy connection string to DATABASE_URL
- Run `npm run db:deploy` for production migrations

### Discord OAuth Setup
1. Go to https://discord.com/developers/applications
2. Create new application
3. Go to OAuth2 section
4. Add redirect URI: `your-domain.com/api/auth/discord/callback`
5. Copy Client ID and Client Secret to .env

## Troubleshooting

### Common Issues

1. **Prisma Client not found**
   ```bash
   npm run db:generate
   ```

2. **Database connection failed**
   - Check DATABASE_URL in .env
   - Ensure Neon database is running
   - Verify connection string format

3. **Discord OAuth not working**
   - Check DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET
   - Verify redirect URI matches exactly
   - Ensure Discord app is properly configured

4. **CORS errors**
   - Check NEXTAUTH_URL matches your frontend URL
   - Verify backend CORS configuration

### Development Tips

- Use `npm run db:studio` to browse database visually
- Check server logs for API errors
- Use browser dev tools for frontend debugging
- Test API endpoints with tools like Postman or Thunder Client
