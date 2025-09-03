# MCQ Assessment Platform - Local Setup Guide

## Prerequisites

Before you start, make sure you have these installed on your laptop:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Setup Steps

### 1. Install Dependencies

Open your terminal/command prompt in the project folder and run:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with your configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres.wakskrjtocclupdxywcy:Patel@supa123@aws-0-us-east-2.pooler.supabase.com:6543/postgres

# Supabase Configuration (for frontend)
VITE_SUPABASE_URL=https://wakskrjtocclupdxywcy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indha3Nrcmp0b2NjbHVwZHh5d2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDY3NjEsImV4cCI6MjA2OTA4Mjc2MX0.o5Ssodq8GsBsunUytOQMe7iPdNp9_-FEGTyylu6LvsY

# OpenAI API Key (for AI question generation)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (optional - for sending assessment invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Set Up Database Tables

Run this command to create all necessary database tables:

```bash
npm run db:push
```

If you get prompted about table creation, press Enter or type "+" to confirm.

### 4. Start the Application

Run the development server:

```bash
npm run dev
```

The application will start on: **http://localhost:5000**

## Important Notes

### Database Setup
- The database tables will be created automatically when you run `npm run db:push`
- If you encounter database connection issues, double-check your DATABASE_URL format

### OpenAI API Key
- Get your API key from: https://platform.openai.com/api-keys
- Replace `your_openai_api_key_here` in the .env file with your actual key
- This enables AI-powered question generation

### Email Configuration (Optional)
- For Gmail, use an "App Password" instead of your regular password
- Enable 2-factor authentication first, then generate an app password
- This enables sending assessment invitations to candidates

## Default Login

Use these credentials to access the admin dashboard:
- **Email:** admin@demo.com
- **Password:** Any password (authentication is simplified for demo)

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Admin and candidate pages
│   │   └── lib/           # Utilities and API client
├── server/                # Backend Express server
│   ├── lib/               # Database, AI, and email services
│   └── routes.ts          # API endpoints
├── shared/                # Shared TypeScript types and schemas
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Update database schema
- `npm run db:studio` - Open database admin panel

## Features Available

✅ **Admin Dashboard**
- Create and manage assessments
- AI-powered question generation
- View candidate results and analytics

✅ **Assessment Creation**
- Custom time limits per assessment
- Multiple question categories
- Difficulty levels (easy, medium, hard)

✅ **Candidate Experience**
- Secure assessment links with expiration
- Real-time timer during assessment
- Automatic submission when time expires

✅ **Results & Analytics**
- Automatic grading
- Detailed candidate performance reports
- Pass/fail analytics with customizable thresholds

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Database connection failed**
   - Verify your DATABASE_URL is correct
   - Check if your Supabase project is active
   - Ensure your IP is allowlisted in Supabase settings

3. **Port 5000 already in use**
   - Kill the process using port 5000: `npx kill-port 5000`
   - Or change the port by setting: `PORT=3000 npm run dev`

4. **AI questions not generating**
   - Verify your OPENAI_API_KEY is set correctly
   - Check if you have sufficient OpenAI credits

## Getting Help

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that your database connection is working

Your MCQ Assessment Platform is now ready to use locally! 🚀