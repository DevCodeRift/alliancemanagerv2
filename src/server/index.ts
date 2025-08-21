import express from 'express';
import cors from 'cors';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { GraphQLClient } from 'graphql-request';
import * as dotenv from 'dotenv';
import type { Request } from 'express';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// GraphQL client for PnW API
const pnwClient = new GraphQLClient(process.env.PNW_API_BASE_URL || 'https://api.politicsandwar.com/graphql');

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://www.alliancemanager.dev'
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';

// Types
interface JWTPayload {
  userId: string;
  email?: string;
  username?: string;
  verified: boolean;
}

interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, payload: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = payload as JWTPayload;
    next();
  });
};

// Helper function to generate JWT
const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// PnW API Queries
const GET_NATION_QUERY = `
  query GetNation($id: [Int!], $name: [String!]) {
    nations(id: $id, name: $name, first: 1) {
      data {
        id
        nation_name
        leader_name
        alliance_id
        alliance {
          name
        }
        score
        cities
        color
        continent
        war_policy
        domestic_policy
        last_active
      }
    }
  }
`;

const VERIFY_API_KEY_QUERY = `
  query VerifyApiKey($api_key: String!) {
    me(api_key: $api_key) {
      nation {
        id
        nation_name
        leader_name
        alliance_id
        alliance {
          name
        }
      }
    }
  }
`;

// API Routes

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User registration with username/password
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        verified: false
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      username: user.username || undefined,
      verified: user.verified
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        verified: user.verified,
        nationId: user.nationId,
        nationName: user.nationName
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login with username/password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      username: user.username || undefined,
      verified: user.verified
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        verified: user.verified,
        nationId: user.nationId,
        nationName: user.nationName,
        leaderName: user.leaderName
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Discord OAuth initiation
app.get('/api/auth/discord', (_req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    process.env.NODE_ENV === 'production' 
      ? 'https://www.alliancemanager.dev/api/auth/discord/callback'
      : 'http://localhost:5173/api/auth/discord/callback'
  );
  
  const scope = encodeURIComponent('identify email');
  const state = jwt.sign({ timestamp: Date.now() }, JWT_SECRET, { expiresIn: '10m' });

  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  
  res.json({ authUrl: discordAuthUrl });
});

// Discord OAuth callback
app.post('/api/auth/discord/callback', async (req, res) => {
  try {
    const { code, state } = req.body;

    // Verify state parameter
    try {
      jwt.verify(state, JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NODE_ENV === 'production' 
          ? 'https://www.alliancemanager.dev/api/auth/discord/callback'
          : 'http://localhost:5173/api/auth/discord/callback'
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.status(400).json({ error: 'Failed to obtain Discord access token' });
    }

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const discordUser = await userResponse.json();

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { discordId: discordUser.id }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          discordId: discordUser.id,
          discordUsername: discordUser.username,
          email: discordUser.email,
          verified: false
        }
      });

      // Create account record
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'discord',
          providerAccountId: discordUser.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          token_type: tokenData.token_type,
          scope: tokenData.scope
        }
      });
    } else {
      // Update existing user
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastActive: new Date(),
          email: discordUser.email || user.email,
          discordUsername: discordUser.username
        }
      });

      // Update account record
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'discord',
            providerAccountId: discordUser.id
          }
        },
        update: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in
        },
        create: {
          userId: user.id,
          type: 'oauth',
          provider: 'discord',
          providerAccountId: discordUser.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          token_type: tokenData.token_type,
          scope: tokenData.scope
        }
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      username: user.discordUsername || undefined,
      verified: user.verified
    });

    res.json({
      message: 'Discord login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.discordUsername,
        verified: user.verified,
        nationId: user.nationId,
        nationName: user.nationName,
        leaderName: user.leaderName
      }
    });

  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
app.get('/api/user/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        discordId: true,
        discordUsername: true,
        nationId: true,
        nationName: true,
        leaderName: true,
        verified: true,
        createdAt: true,
        lastActive: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { email, username } = req.body;
    const userId = req.user!.userId;

    // Check if email/username is already taken by another user
    if (email || username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : [])
              ]
            }
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({ 
          error: existingUser.email === email ? 'Email already in use' : 'Username already taken'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email }),
        ...(username && { username }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        discordUsername: true,
        nationId: true,
        nationName: true,
        leaderName: true,
        verified: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search for PnW nation
app.get('/api/pnw/nation/search', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // First try to find in our cache
    let nations = await prisma.nation.findMany({
      where: {
        OR: [
          { nationName: { contains: query as string, mode: 'insensitive' } },
          { leaderName: { contains: query as string, mode: 'insensitive' } }
        ]
      },
      take: 10
    });

    // If not found in cache or cache is old, query PnW API
    if (nations.length === 0) {
      try {
        const response = await pnwClient.request(GET_NATION_QUERY, {
          name: [query]
        }) as any;

        if (response.nations?.data?.length > 0) {
          const nation = response.nations.data[0];
          
          // Update our cache
          await prisma.nation.upsert({
            where: { id: nation.id },
            update: {
              nationName: nation.nation_name,
              leaderName: nation.leader_name,
              allianceId: nation.alliance_id,
              allianceName: nation.alliance?.name,
              score: nation.score,
              cities: nation.cities,
              color: nation.color,
              continent: nation.continent,
              warPolicy: nation.war_policy,
              domesticPolicy: nation.domestic_policy,
              lastActive: nation.last_active ? new Date(nation.last_active) : null,
              updatedAt: new Date()
            },
            create: {
              id: nation.id,
              nationName: nation.nation_name,
              leaderName: nation.leader_name,
              allianceId: nation.alliance_id,
              allianceName: nation.alliance?.name,
              score: nation.score,
              cities: nation.cities,
              color: nation.color,
              continent: nation.continent,
              warPolicy: nation.war_policy,
              domesticPolicy: nation.domestic_policy,
              lastActive: nation.last_active ? new Date(nation.last_active) : null,
              updatedAt: new Date()
            }
          });

          nations = [nation];
        }
      } catch (apiError) {
        console.error('PnW API error:', apiError);
        // Continue with empty results if API fails
      }
    }

    res.json({ nations });

  } catch (error) {
    console.error('Nation search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify PnW nation with API key
app.post('/api/pnw/verify', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { apiKey, nationId } = req.body;
    const userId = req.user!.userId;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Verify API key with PnW
    try {
      const response = await pnwClient.request(VERIFY_API_KEY_QUERY, {
        api_key: apiKey
      }) as any;

      if (!response.me?.nation) {
        return res.status(400).json({ error: 'Invalid API key or no nation associated' });
      }

      const nation = response.me.nation;

      // If nationId provided, verify it matches
      if (nationId && nation.id !== nationId) {
        return res.status(400).json({ error: 'API key does not match the specified nation' });
      }

      // Check if this nation is already verified by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { nationId: nation.id },
            { id: { not: userId } },
            { verified: true }
          ]
        }
      });

      if (existingUser) {
        return res.status(409).json({ error: 'This nation is already verified by another user' });
      }

      // Hash the API key for storage
      const hashedApiKey = await bcrypt.hash(apiKey, 12);

      // Update user with verification
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          nationId: nation.id,
          nationName: nation.nation_name,
          leaderName: nation.leader_name,
          apiKey: hashedApiKey,
          verified: true,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          username: true,
          discordUsername: true,
          nationId: true,
          nationName: true,
          leaderName: true,
          verified: true
        }
      });

      // Update nation cache
      await prisma.nation.upsert({
        where: { id: nation.id },
        update: {
          nationName: nation.nation_name,
          leaderName: nation.leader_name,
          allianceId: nation.alliance_id,
          allianceName: nation.alliance?.name,
          updatedAt: new Date()
        },
        create: {
          id: nation.id,
          nationName: nation.nation_name,
          leaderName: nation.leader_name,
          allianceId: nation.alliance_id,
          allianceName: nation.alliance?.name,
          updatedAt: new Date()
        }
      });

      res.json({
        message: 'Nation verified successfully',
        user: updatedUser
      });

    } catch (apiError) {
      console.error('PnW API verification error:', apiError);
      return res.status(400).json({ error: 'Failed to verify API key with Politics and War' });
    }

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's nation data
app.get('/api/user/nation', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user || !user.nationId) {
      return res.status(404).json({ error: 'No verified nation found' });
    }

    const nation = await prisma.nation.findUnique({
      where: { id: user.nationId }
    });

    if (!nation) {
      return res.status(404).json({ error: 'Nation data not found' });
    }

    res.json({
      nation: {
        id: nation.id,
        nationName: nation.nationName,
        leaderName: nation.leaderName,
        allianceId: nation.allianceId,
        allianceName: nation.allianceName,
        score: nation.score,
        cities: nation.cities,
        color: nation.color,
        continent: nation.continent,
        warPolicy: nation.warPolicy,
        domesticPolicy: nation.domesticPolicy,
        lastActive: nation.lastActive
      }
    });

  } catch (error) {
    console.error('Nation fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (invalidate token - client-side handling)
app.post('/api/auth/logout', authenticateToken, (_req: AuthenticatedRequest, res) => {
  res.json({ message: 'Logout successful' });
});

// Change password
app.post('/api/user/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.password) {
      return res.status(400).json({ error: 'User does not have a password set' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword, updatedAt: new Date() }
    });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;