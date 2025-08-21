const jwt = require('jsonwebtoken');

module.exports = function handler(req, res) {
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
      console.error('Missing DISCORD_CLIENT_ID environment variable');
      return res.status(500).json({ error: 'Discord client ID not configured' });
    }

    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://www.alliancemanager.dev/auth/discord/callback'
      : 'http://localhost:5173/auth/discord/callback';

    // Create a state parameter for security
    const state = jwt.sign(
      { 
        timestamp: Date.now(),
        redirectUri: redirectUri 
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '10m' }
    );

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=identify email guilds&` +
      `state=${state}`;

    console.log('Generated Discord OAuth URL successfully');
    return res.status(200).json({ 
      authUrl: discordAuthUrl,
      state: state 
    });

  } catch (error) {
    console.error('Error generating Discord OAuth URL:', error);
    return res.status(500).json({ 
      error: 'Failed to generate Discord OAuth URL',
      details: error.message 
    });
  }
};
