import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwt from 'jsonwebtoken';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    
    if (!clientId) {
      console.error('DISCORD_CLIENT_ID not found in environment variables');
      return res.status(500).json({ error: 'Discord OAuth not configured' });
    }

    const redirectUri = encodeURIComponent(
      process.env.NODE_ENV === 'production' 
        ? 'https://www.alliancemanager.dev/api/auth/discord/callback'
        : 'http://localhost:5173/api/auth/discord/callback'
    );
    
    const scope = encodeURIComponent('identify email');
    const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
    
    // Use jwt.sign properly
    const state = jwt.sign({ timestamp: Date.now() }, JWT_SECRET, { expiresIn: '10m' });

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    
    console.log('Discord OAuth URL generated successfully');
    res.json({ authUrl: discordAuthUrl });
  } catch (error) {
    console.error('Discord OAuth initiation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
