#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking HMS SaaS Backend Setup...\n');

let hasErrors = false;

// Check .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  hasErrors = true;
} else {
  console.log('✅ .env file exists');
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Check DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    const dbUrl = envContent.match(/DATABASE_URL="(.+)"/)?.[1];
    if (dbUrl && dbUrl.includes('localhost')) {
      console.log('⚠️  Using local PostgreSQL database');
      console.log('   Make sure PostgreSQL is running!');
    } else if (dbUrl && dbUrl.includes('supabase')) {
      console.log('✅ Using Supabase database');
    } else if (dbUrl && dbUrl.includes('your-project')) {
      console.log('❌ DATABASE_URL not configured (still has placeholder)');
      console.log('   Please update with your actual database URL');
      hasErrors = true;
    } else {
      console.log('✅ DATABASE_URL is configured');
    }
  } else {
    console.log('❌ DATABASE_URL not found in .env');
    hasErrors = true;
  }
  
  // Check JWT_SECRET
  if (envContent.includes('JWT_SECRET=')) {
    const jwtSecret = envContent.match(/JWT_SECRET="(.+)"/)?.[1];
    if (jwtSecret && jwtSecret.includes('change-this')) {
      console.log('⚠️  JWT_SECRET is using default value');
      console.log('   Consider changing it for production');
    } else {
      console.log('✅ JWT_SECRET is configured');
    }
  }
}

// Check Prisma Client
const prismaClientPath = path.join(__dirname, '..', '..', 'node_modules', '@prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  console.log('❌ Prisma Client not generated');
  console.log('   Run: npx prisma generate');
  hasErrors = true;
} else {
  console.log('✅ Prisma Client is generated');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ node_modules not found');
  console.log('   Run: npm install');
  hasErrors = true;
} else {
  console.log('✅ Dependencies installed');
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('\n❌ Setup incomplete. Please fix the errors above.\n');
  console.log('📖 Read SETUP_INSTRUCTIONS.md for detailed steps.\n');
  process.exit(1);
} else {
  console.log('\n✅ Backend setup looks good!\n');
  console.log('Next steps:');
  console.log('1. Run migrations: npx prisma migrate dev --name init');
  console.log('2. Start server: npm run dev');
  console.log('3. Visit API docs: http://localhost:3001/docs\n');
}
