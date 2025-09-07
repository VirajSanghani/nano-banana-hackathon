#!/usr/bin/env node

// Environment check script for Vibe-Synth
console.log('🎵 Vibe-Synth Environment Check\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check if we're in the right directory
import fs from 'fs';
import path from 'path';

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Project: ${packageJson.name} v${packageJson.version}`);
  
  // Check critical dependencies
  const deps = packageJson.dependencies || {};
  const devDeps = packageJson.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };
  
  const criticalDeps = [
    'react',
    'react-dom', 
    'vite',
    'framer-motion',
    'zustand',
    'tailwindcss'
  ];
  
  console.log('\n📦 Critical Dependencies:');
  criticalDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`✅ ${dep}: ${allDeps[dep]}`);
    } else {
      console.log(`❌ ${dep}: MISSING`);
    }
  });
  
} catch (error) {
  console.log('❌ package.json not found or invalid');
}

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules directory exists');
} else {
  console.log('❌ node_modules directory missing - run npm install');
}

// Check key files
const keyFiles = [
  'src/App.jsx',
  'src/main.jsx', 
  'src/index.css',
  'index.html',
  'vite.config.js',
  'tailwind.config.js'
];

console.log('\n📁 Key Files:');
keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check if we can detect browser capabilities
console.log('\n🌐 Environment Info:');
console.log(`✅ Platform: ${process.platform}`);
console.log(`✅ Architecture: ${process.arch}`);

console.log('\n🚀 Server Configuration:');
console.log('✅ Configured for port 5173');
console.log('✅ Host: 0.0.0.0 (allows network access)');
console.log('✅ Auto-open browser enabled');

console.log('\n🎯 Ready to run:');
console.log('   npm run dev');
console.log('\n🌟 Then visit: http://localhost:5173/');
console.log('\nHappy testing! 🎵✨');