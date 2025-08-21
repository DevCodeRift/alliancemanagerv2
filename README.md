# Alliance Manager v2 🚀

A modern web application for managing Politics and War alliances with dual authentication (Discord OAuth + username/password) and comprehensive PnW API integration.

![Cyberpunk 2077 Theme](https://img.shields.io/badge/Theme-Cyberpunk%202077-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

## 🌟 Features

### Authentication & User Management
- **Dual Authentication**: Discord OAuth and traditional username/password
- **PnW Nation Verification**: Verify ownership with Politics and War API keys
- **Secure Sessions**: JWT-based authentication with refresh tokens
- **Profile Management**: Update user information and change passwords

### Politics and War Integration
- **Nation Search**: Find and verify PnW nations
- **API Key Verification**: Secure PnW account linking
- **Real-time Data**: Cached nation data with PnW API integration
- **Alliance Management**: Track alliance members and statistics

### Modern UI/UX
- **Cyberpunk 2077 Theme**: Futuristic Windows OS interface
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: CSS animations and transitions
- **DevCodeRift Branding**: Custom branded interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended for deployment)
- Discord Developer Application
- Politics and War API access

### Installation

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd alliancemanagerv2
   npm install
   npm run setup
   ```

2. **Configure environment:**
   Update `.env` with your credentials:
   ```bash
   DATABASE_URL="postgresql://..."
   DISCORD_CLIENT_ID="your-discord-app-id"
   DISCORD_CLIENT_SECRET="your-discord-app-secret"
   ```

3. **Initialize database:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start development:**
   ```bash
   npm run dev:all
   ```

Visit `http://localhost:5173` for the frontend and `http://localhost:3001` for the API.

## 🚀 Quick Setup

### 1. Database Setup (Neon)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy your connection string
4. Update `DATABASE_URL` in `.env`

### 2. Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 → General
4. Add redirect URI: `http://localhost:5173/api/auth/callback/discord`
5. Copy Client ID and Client Secret to `.env`

### 3. Politics and War API

1. Go to [Politics and War](https://politicsandwar.com/account/)
2. Generate an API key
3. Add it to your `.env` file

### 4. Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Database Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. Run Development Server

```bash
npm run dev
```

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js API routes
- **Database**: PostgreSQL (Neon for production)
- **Authentication**: NextAuth.js with Discord OAuth + Username/Password
- **ORM**: Prisma

## 📋 Features

### Authentication
- Discord OAuth login
- Username/password registration
- Politics and War account verification via API key
- User identification by PnW nation ID

### Alliance Management
- Member management
- Role-based permissions
- Integration with Discord bot
- Real-time updates

## 🚀 Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Vercel:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for JWT signing
- `NEXTAUTH_URL` - Your production URL
- `DISCORD_CLIENT_ID` - Discord OAuth client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth client secret

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
