# MCQ Assessment Platform

An AI-powered MCQ-based recruitment assessment platform with glassmorphism design.

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18 or higher)
- npm package manager

### 2. Setup
```bash
# Install dependencies
npm install

# Run setup script (creates .env and sets up database)
node setup-local.js

# Start development server
npm run dev
```

### 3. Access the Platform
- Open: http://localhost:5000
- Admin login: admin@demo.com (any password)

## Manual Setup

If you prefer to set up manually:

### 1. Create .env file
```bash
DATABASE_URL=postgresql://postgres.wakskrjtocclupdxywcy:Patel@supa123@aws-0-us-east-2.pooler.supabase.com:6543/postgres
VITE_SUPABASE_URL=https://wakskrjtocclupdxywcy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3Nrcmp0b2NjbHVwZHh5d2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDY3NjEsImV4cCI6MjA2OTA4Mjc2MX0.o5Ssodq8GsBsunUytOQMe7iPdNp9_-FEGTyylu6LvsY
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Install and Setup
```bash
npm install
npm run db:push
npm run dev
```

## Features

- **Admin Dashboard**: Create and manage assessments
- **AI Question Generation**: Powered by OpenAI
- **Timed Assessments**: Secure candidate testing
- **Email Invitations**: Send assessment links to candidates
- **Real-time Results**: Automatic grading and analytics
- **Glassmorphism UI**: Modern, professional design

## Project Structure

```
├── client/src/          # React frontend
├── server/              # Express backend  
├── shared/              # Shared types and schemas
├── LOCAL_SETUP.md       # Detailed setup guide
└── setup-local.js       # Automated setup script
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Update database schema
- `node setup-local.js` - Automated local setup

## Need Help?

Check `LOCAL_SETUP.md` for detailed setup instructions and troubleshooting.