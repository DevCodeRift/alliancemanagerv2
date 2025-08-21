module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  return res.status(200).json({
    message: 'Environment check',
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    hasDiscordClientId: !!process.env.DISCORD_CLIENT_ID,
    hasDiscordSecret: !!process.env.DISCORD_CLIENT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('DISCORD') || key.startsWith('NEXTAUTH') || key.startsWith('DATABASE')),
    timestamp: new Date().toISOString()
  });
};
