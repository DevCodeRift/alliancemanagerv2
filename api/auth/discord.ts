import jwt from 'jsonwebtoken';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    
    if (!clientId) {
      return res.status(500).json({ error: 'Discord OAuth not configured' });
    }

    const redirectUri = encodeURIComponent(
      process.env.NODE_ENV === 'production' 
        ? 'https://www.alliancemanager.dev/api/auth/discord/callback'
        : 'http://localhost:5173/api/auth/discord/callback'
    );
    
    const scope = encodeURIComponent('identify email');
    const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';
    const state = jwt.sign({ timestamp: Date.now() }, JWT_SECRET, { expiresIn: '10m' });

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    
    res.json({ authUrl: discordAuthUrl });
  } catch (error) {
    console.error('Discord OAuth initiation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
