#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';

console.log('🚀 Setting up Alliance Manager v2 Environment...\n');

// Check if .env already exists
if (existsSync('.env')) {
  console.log('✅ .env file already exists');
  console.log('💡 If you need to reconfigure, delete .env and run this script again\n');
} else {
  // Read the example file
  try {
    const envExample = readFileSync('.env.example', 'utf8');
    
    // Generate a random secret for NextAuth
    const nextAuthSecret = randomBytes(32).toString('hex');
    
    // Replace the example values with generated ones
    let envContent = envExample
      .replace('your-secret-key-here-replace-with-random-string', nextAuthSecret)
      .replace('http://localhost:5173', 'http://localhost:5173');
    
    // Write the new .env file
    writeFileSync('.env', envContent);
    
    console.log('✅ Created .env file with generated secrets');
    console.log('🔧 Please update the following values in your .env file:');
    console.log('   - DATABASE_URL (get from Neon.tech)');
    console.log('   - DISCORD_CLIENT_ID (get from Discord Developer Portal)');
    console.log('   - DISCORD_CLIENT_SECRET (get from Discord Developer Portal)\n');
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error);
    process.exit(1);
  }
}

// Check if Prisma client is generated
console.log('🔍 Checking Prisma setup...');
try {
  await import('@prisma/client');
  console.log('✅ Prisma client is ready');
} catch (error) {
  console.log('⚠️  Prisma client not generated. Run: npm run db:generate');
}

console.log('\n🎯 Next steps:');
console.log('1. Update your .env file with the required values');
console.log('2. Run `npm run db:generate` to generate Prisma client');
console.log('3. Run `npm run db:migrate` to create database tables');
console.log('4. Run `npm run dev:all` to start both frontend and backend');
console.log('\n🌟 Happy coding!');
