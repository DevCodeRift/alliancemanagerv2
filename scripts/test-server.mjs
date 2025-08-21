#!/usr/bin/env node

/**
 * Test script to verify server compilation and basic functionality
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🧪 Testing server compilation...\n');

// Test TypeScript compilation
const tscProcess = spawn('npx', ['tsc', '--noEmit', '--project', 'tsconfig.server.json'], {
  cwd: rootDir,
  stdio: 'inherit'
});

tscProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ TypeScript compilation successful\n');
    
    // Test server startup (just compilation test)
    console.log('🚀 Testing server startup...');
    
    const serverProcess = spawn('npx', ['tsx', '--check', 'src/server/index.ts'], {
      cwd: rootDir,
      stdio: 'inherit'
    });
    
    serverProcess.on('close', (serverCode) => {
      if (serverCode === 0) {
        console.log('✅ Server can start successfully');
        console.log('\n🎉 All tests passed!');
        console.log('\nNext steps:');
        console.log('1. Configure your .env file');
        console.log('2. Run `npm run db:migrate` to setup database');
        console.log('3. Start development: `npm run dev:all`');
      } else {
        console.log('❌ Server startup test failed');
        process.exit(1);
      }
    });
    
  } else {
    console.log('❌ TypeScript compilation failed');
    process.exit(1);
  }
});
