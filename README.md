# 💰 Spending Tracker

A simple Next.js application to track your expenses and manage your budget using Google Sheets as a backend database.

## Features

- 📊 Track expenses by category (groceries, hobby, transportation, etc.)
- 💳 Add expenses with amount, category, description, and date
- 📈 View total spending and recent expenses
- 🔄 Real-time sync with Google Sheets
- 📱 Responsive design with Tailwind CSS
- ⚡ Fast and modern UI

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Google Sheets API
- **Authentication**: Google Service Account

## Prerequisites

- Node.js 18+ 
- Google Cloud Platform account
- Google Sheets API enabled

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd spending-tracker
npm install
```

### 2. Google Cloud Platform Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 3. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `spending-tracker-service`
   - Description: `Service account for spending tracker app`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"
6. Click on the created service account
7. Go to the "Keys" tab
8. Click "Add Key" > "Create New Key"
9. Choose "JSON" format and download the key file

### 4. Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name the first sheet "SpendingTracker"
4. Add headers in the first row:
   ```
   ID | Amount | Category | Description | Date | Timestamp
   ```
5. Share the spreadsheet with your service account email (found in the JSON key file)
6. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

### 5. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your configuration:
   ```env
   GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
   GOOGLE_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account",...}
   ```

   **Important**: For the `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`, you need to:
   - Open the downloaded JSON key file
   - Copy the entire JSON content
   - Paste it as a single line in the environment variable
   - Make sure to escape any quotes properly

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Add an Expense**:
   - Fill in the amount, select a category, add a description, and choose a date
   - Click "Add Expense"
   - The expense will be saved to your Google Sheet

2. **View Expenses**:
   - Recent expenses are displayed on the right side
   - Total spending is shown at the top
   - Expenses are sorted by date (newest first)

## Project Structure

```
src/
├── app/
│   ├── api/spending/route.ts    # API routes for Google Sheets integration
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page component
├── components/
│   ├── SpendingForm.tsx         # Form for adding expenses
│   └── SpendingList.tsx         # Component for displaying expenses
└── types/
    └── spending.ts              # TypeScript type definitions
```

## Available Categories

- 🛒 Groceries
- 🎨 Hobby
- 🚗 Transportation
- 🎬 Entertainment
- ⚡ Utilities
- 🍽️ Dining
- 🛍️ Shopping
- 🏥 Health
- 📚 Education
- 📝 Other

## Troubleshooting

### Common Issues

1. **"Google Sheets not configured" error**:
   - Check that your `.env.local` file exists and has the correct values
   - Verify that the service account credentials are properly formatted

2. **"Failed to fetch spending data" error**:
   - Ensure the Google Sheets API is enabled
   - Check that the service account has access to the spreadsheet
   - Verify the spreadsheet ID is correct

3. **"Missing required fields" error**:
   - Make sure all form fields are filled out before submitting

### Debug Mode

To see detailed error messages, check the browser console and server logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.
