#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testGoogleSheets() {
  console.log('🧪 Testing Google Sheets Connection...\n');

  const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
  const CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

  if (!SPREADSHEET_ID || !CREDENTIALS) {
    console.log('❌ Missing environment variables:');
    console.log('   - GOOGLE_SPREADSHEET_ID:', SPREADSHEET_ID ? '✅ Set' : '❌ Missing');
    console.log('   - GOOGLE_SERVICE_ACCOUNT_CREDENTIALS:', CREDENTIALS ? '✅ Set' : '❌ Missing');
    return;
  }

  try {
    // Parse credentials
    const credentials = JSON.parse(CREDENTIALS);
    console.log('✅ Credentials parsed successfully');
    console.log('   Service Account Email:', credentials.client_email);

    // Initialize auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized');

    // Test reading
    console.log('\n📖 Testing READ access...');
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'SpendingTracker!A:F',
    });

    console.log('✅ READ access successful');
    console.log('   Rows found:', (readResponse.data.values || []).length);

    // Test writing
    console.log('\n✍️ Testing WRITE access...');
    const testRow = [
      `test_${Date.now()}`,
      99.99,
      'other',
      'Test entry - can be deleted',
      new Date().toISOString().split('T')[0],
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'SpendingTracker!A:F',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [testRow],
      },
    });

    console.log('✅ WRITE access successful');
    console.log('   Test row added successfully');

    console.log('\n🎉 All tests passed! Your Google Sheets integration is working correctly.');
    console.log('\n💡 You can now delete the test row from your spreadsheet if you want.');

  } catch (error) {
    console.log('\n❌ Test failed:');
    console.log('   Error:', error.message);
    
    if (error.code === 403) {
      console.log('\n🔧 To fix this:');
      console.log('   1. Open your Google Spreadsheet');
      console.log('   2. Click "Share" in the top right');
      console.log('   3. Add your service account email as an Editor');
      console.log('   4. Make sure the sheet is named "SpendingTracker"');
    }
  }
}

testGoogleSheets(); 