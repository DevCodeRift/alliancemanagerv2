#!/usr/bin/env node

console.log('🚀 Alliance Manager v2 Setup');
console.log('');

console.log('📋 Setup Checklist:');
console.log('');

console.log('1. 🗄️  Database Setup (Neon):');
console.log('   → Go to: https://console.neon.tech/');
console.log('   → Create a new project');
console.log('   → Copy your connection string');
console.log('   → Update DATABASE_URL in .env file');
console.log('');

console.log('2. 🎮 Discord OAuth Setup:');
console.log('   → Go to: https://discord.com/developers/applications');
console.log('   → Create a new application');
console.log('   → Go to OAuth2 → General');
console.log('   → Add redirect URI: http://localhost:5173/api/auth/callback/discord');
console.log('   → Copy Client ID and Client Secret to .env');
console.log('');

console.log('3. ⚔️  Politics and War API:');
console.log('   → Go to: https://politicsandwar.com/account/');
console.log('   → Generate an API key');
console.log('   → Add it to your .env file');
console.log('');

console.log('4. 🔧 Environment Setup:');
console.log('   → Copy .env.example to .env');
console.log('   → Fill in all the values from steps 1-3');
console.log('');

console.log('5. 🏗️  Database Migration:');
console.log('   → Run: npx prisma migrate dev --name init');
console.log('   → Run: npx prisma generate');
console.log('');

console.log('6. 🎯 Start Development:');
console.log('   → Run: npm run dev');
console.log('');

console.log('📚 For detailed instructions, see README.md');
console.log('');

console.log('🚀 Ready to deploy to Vercel when you are!');
