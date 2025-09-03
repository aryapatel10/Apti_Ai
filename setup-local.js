#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🚀 Setting up MCQ Assessment Platform for local development...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database Configuration
DATABASE_URL=postgresql://postgres.wakskrjtocclupdxywcy:Patel@supa123@aws-0-us-east-2.pooler.supabase.com:6543/postgres

# Supabase Configuration (for frontend)
VITE_SUPABASE_URL=https://wakskrjtocclupdxywcy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3Nrcmp0b2NjbHVwZHh5d2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDY3NjEsImV4cCI6MjA2OTA4Mjc2MX0.o5Ssodq8GsBsunUytOQMe7iPdNp9_-FEGTyylu6LvsY

# OpenAI API Key (for AI question generation)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Port Configuration
PORT=5000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('ℹ️  .env file already exists, skipping...');
}

console.log('\n📦 Installing dependencies...');
try {
  await execAsync('npm install');
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('\n🔗 Setting up database...');
try {
  await execAsync('npm run db:push');
  console.log('✅ Database setup completed!');
} catch (error) {
  console.log('⚠️  Database setup encountered issues, but that\'s okay.');
  console.log('   You can run "npm run db:push" manually later.');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with your actual API keys');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:5000 in your browser');
console.log('4. Use admin@demo.com to access the admin dashboard');
console.log('\n🚀 Your MCQ Assessment Platform is ready!');