// Simple Discord OAuth endpoint without external dependencies
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
    console.log('Discord OAuth endpoint called');
    
    const clientId = process.env.DISCORD_CLIENT_ID;
    console.log('Discord Client ID:', clientId ? 'SET' : 'NOT SET');
    
    if (!clientId) {
      console.error('Missing DISCORD_CLIENT_ID environment variable');
      return res.status(500).json({ 
        error: 'Discord client ID not configured',
        debug: 'DISCORD_CLIENT_ID is not set in environment variables'
      });
    }

    const redirectUri = process.env.NODE_ENV === 'production' 
      ? 'https://www.alliancemanager.dev/auth/discord/callback'
      : 'http://localhost:5173/auth/discord/callback';
    
    console.log('Redirect URI:', redirectUri);

    // Create a simple state parameter (random string for now)
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('Simple state generated successfully');

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=identify email guilds&` +
      `state=${state}`;

    console.log('Generated Discord OAuth URL successfully');
    console.log('Auth URL length:', discordAuthUrl.length);
    
    return res.status(200).json({ 
      authUrl: discordAuthUrl,
      state: state 
    });

  } catch (error) {
    console.error('Error generating Discord OAuth URL:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Failed to generate Discord OAuth URL',
      details: error.message,
      stack: error.stack
    });
  }
};
