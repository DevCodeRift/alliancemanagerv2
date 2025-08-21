import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.body;
    const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';

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
    const token = jwt.sign({
      userId: user.id,
      email: user.email || undefined,
      username: user.discordUsername || undefined,
      verified: user.verified
    }, JWT_SECRET, { expiresIn: '7d' });

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
  } finally {
    await prisma.$disconnect();
  }
}
