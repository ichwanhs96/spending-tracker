import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { SpendingEntry } from '@/types/spending';

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_NAME = 'SpendingTracker';
const CREDENTIALS = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;

if (!SPREADSHEET_ID || !CREDENTIALS) {
  console.error('Missing Google Sheets configuration. Please set GOOGLE_SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_CREDENTIALS environment variables.');
}

// Initialize Google Sheets API
const getGoogleSheets = () => {
  try {
    const credentials = JSON.parse(CREDENTIALS || '{}');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    return null;
  }
};

// Helper function to convert sheet data to SpendingEntry objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sheetDataToEntries = (data: any[][]): SpendingEntry[] => {
  if (!data || data.length <= 1) return [];
  
  return data.slice(1).map((row, index) => ({
    id: row[0] || `entry_${Date.now()}_${index}`,
    amount: parseFloat(row[1]) || 0,
    category: row[2] || 'other',
    description: row[3] || '',
    date: row[4] || new Date().toISOString().split('T')[0],
    timestamp: row[5] || new Date().toISOString(),
  }));
};

// Helper function to convert SpendingEntry to sheet row
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const entryToSheetRow = (entry: Omit<SpendingEntry, 'id' | 'timestamp'>): any[] => {
  const id = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  return [
    id,
    entry.amount,
    entry.category,
    entry.description,
    entry.date,
    timestamp,
  ];
};

export async function GET() {
  if (!SPREADSHEET_ID || !CREDENTIALS) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 500 }
    );
  }

  try {
    const sheets = getGoogleSheets();
    if (!sheets) {
      return NextResponse.json(
        { error: 'Failed to initialize Google Sheets' },
        { status: 500 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
    });

    const rows = response.data.values || [];
    const entries = sheetDataToEntries(rows);

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching spending data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spending data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!SPREADSHEET_ID || !CREDENTIALS) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { amount, category, description, date } = body;

    // Validate required fields
    if (!amount || !category || !description || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheets();
    if (!sheets) {
      return NextResponse.json(
        { error: 'Failed to initialize Google Sheets' },
        { status: 500 }
      );
    }

    // Convert entry to sheet row
    const row = entryToSheetRow({ amount, category, description, date });

    // Append to Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding spending entry:', error);
    return NextResponse.json(
      { error: 'Failed to add spending entry' },
      { status: 500 }
    );
  }
} 