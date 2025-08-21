#!/usr/bin/env node

/**
 * Discord OAuth Configuration Checker
 * Verifies that Discord OAuth environment variables are properly set
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Checking Discord OAuth Configuration...\n');

try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf8');
  
  const lines = envContent.split('\n');
  let clientId = '';
  let clientSecret = '';
  let nextAuthUrl = '';
  
  for (const line of lines) {
    if (line.startsWith('DISCORD_CLIENT_ID=')) {
      clientId = line.split('=')[1]?.replace(/"/g, '') || '';
    }
    if (line.startsWith('DISCORD_CLIENT_SECRET=')) {
      clientSecret = line.split('=')[1]?.replace(/"/g, '') || '';
    }
    if (line.startsWith('NEXTAUTH_URL=')) {
      nextAuthUrl = line.split('=')[1]?.replace(/"/g, '') || '';
    }
  }
  
  console.log('Environment Variables:');
  console.log(`DISCORD_CLIENT_ID: ${clientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`DISCORD_CLIENT_SECRET: ${clientSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXTAUTH_URL: ${nextAuthUrl || 'http://localhost:5173'}`);
  
  if (!clientId || clientId === 'your-discord-client-id') {
    console.log('\n❌ DISCORD_CLIENT_ID is missing or not configured');
    console.log('   → Get this from Discord Developer Portal');
  }
  
  if (!clientSecret || clientSecret === 'your-discord-client-secret') {
    console.log('\n❌ DISCORD_CLIENT_SECRET is missing or not configured');
    console.log('   → Get this from Discord Developer Portal');
  }
  
  if (clientId && clientSecret && 
      clientId !== 'your-discord-client-id' && 
      clientSecret !== 'your-discord-client-secret') {
    console.log('\n✅ Discord OAuth appears to be configured correctly!');
    
    console.log('\n📋 Required Discord Application Settings:');
    console.log('Redirect URIs:');
    console.log('  - http://localhost:5173/api/auth/discord/callback (development)');
    console.log('  - https://www.alliancemanager.dev/api/auth/discord/callback (production)');
    console.log('Scopes: identify, email');
    console.log('\n🚀 You can now test Discord OAuth signup!');
  } else {
    console.log('\n⚠️  Discord OAuth is not fully configured');
    console.log('\n📝 Setup Steps:');
    console.log('1. Go to https://discord.com/developers/applications');
    console.log('2. Create a new application');
    console.log('3. Go to OAuth2 → General');
    console.log('4. Add redirect URIs:');
    console.log('   - http://localhost:5173/api/auth/discord/callback');
    console.log('   - https://www.alliancemanager.dev/api/auth/discord/callback');
    console.log('5. Select scopes: identify, email');
    console.log('6. Copy Client ID and Client Secret to your .env file');
  }
  
} catch (error) {
  console.log('❌ Error reading .env file:', error.message);
  console.log('Make sure .env file exists in the root directory');
}
