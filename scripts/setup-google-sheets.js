#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Google Sheets Setup Helper\n');

console.log('📋 Prerequisites:');
console.log('1. Google Cloud Platform account');
console.log('2. Google Sheets API enabled');
console.log('3. Service account created with JSON key downloaded\n');

console.log('📝 Steps to complete:');
console.log('1. Create a new Google Spreadsheet');
console.log('2. Name the first sheet "SpendingTracker"');
console.log('3. Add these headers in row 1:');
console.log('   ID | Amount | Category | Description | Date | Timestamp');
console.log('4. Share the spreadsheet with your service account email');
console.log('5. Copy the spreadsheet ID from the URL\n');

console.log('🔑 Environment Setup:');
console.log('1. Copy env.example to .env.local:');
console.log('   cp env.example .env.local');
console.log('2. Edit .env.local with your values:');
console.log('   - GOOGLE_SPREADSHEET_ID: Your spreadsheet ID');
console.log('   - GOOGLE_SERVICE_ACCOUNT_CREDENTIALS: Your JSON credentials\n');

console.log('📖 For detailed instructions, see README.md\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
} else {
  console.log('❌ .env.local file not found');
  console.log('   Run: cp env.example .env.local');
}

console.log('\n🚀 Once configured, run: npm run dev'); 