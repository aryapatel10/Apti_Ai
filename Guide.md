# MCQ Assessment Platform

## Overview

This is a full-stack web application for an AI-powered MCQ-based recruitment platform. The system allows admins to create assessments with customizable questions and time limits, while candidates can take assessments through unique time-limited links. The platform features automatic grading, detailed analytics, and email notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (Jan 27, 2025)

- ✅ Completed full local development setup for user's laptop
- ✅ Created comprehensive LOCAL_SETUP.md guide with step-by-step instructions
- ✅ Added automated setup-local.js script for easy initialization
- ✅ Updated README.md with quick start instructions
- ✅ Platform is fully functional with all features working:
  - Database connection to Supabase
  - AI question generation with OpenAI
  - Email invitations for candidates
  - Glassmorphism UI design
  - Admin dashboard and candidate assessment interface

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server responsibilities:

- **Frontend**: React.js with Vite for fast development and building
- **Backend**: Node.js with Express for API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: TailwindCSS with custom glassmorphism design system using shadcn/ui components
- **Authentication**: Custom JWT-based authentication (with provision for Supabase integration)
- **Email Service**: Nodemailer for sending assessment invitations
- **AI Integration**: External AI service for generating questions

## Key Components

### Frontend Architecture
- **Component Library**: Built on Radix UI primitives with shadcn/ui styling
- **State Management**: React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Theme**: Dark theme with glassmorphism effects using CSS custom properties

### Backend Architecture
- **API Structure**: RESTful endpoints organized by feature (auth, assessments, questions)
- **Database Layer**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Storage Interface**: Abstracted storage layer for database operations
- **Middleware**: Request logging, JSON parsing, and error handling

### Data Storage
- **Database**: PostgreSQL with the following main tables:
  - `users`: Admin and candidate information
  - `assessments`: Assessment configurations and questions
  - `assessment_links`: Time-limited assessment access tokens
  - `assessment_results`: Candidate responses and scores
  - `question_bank`: Reusable question repository

### Authentication System
- **Admin Authentication**: Email/password login with session management
- **Candidate Access**: Token-based access through unique assessment links
- **Session Storage**: Local storage for client-side session persistence

## Data Flow

1. **Assessment Creation**: Admin creates assessment → Questions generated/selected → Assessment stored in database
2. **Candidate Invitation**: Admin generates assessment link → Email sent to candidate → Token stored with expiration
3. **Assessment Taking**: Candidate accesses link → Validates token → Presents questions → Collects responses
4. **Result Processing**: Responses submitted → Automatic scoring → Results stored → Analytics available to admin

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL (configured via DATABASE_URL)
- **Email Service**: SMTP server for sending invitations
- **AI Service**: External API for question generation (OpenAI or similar)

### Third-party Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Email Provider**: SMTP service (Gmail, SendGrid, etc.)
- **AI Provider**: OpenAI API or similar for question generation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **ESBuild**: Production bundling for server code
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Client**: Vite dev server with HMR
- **Server**: tsx for TypeScript execution with hot reload
- **Database**: Drizzle push for schema synchronization

### Production Build
- **Client**: Static build output to `dist/public`
- **Server**: ESBuild bundle to `dist/index.js`
- **Database**: Drizzle migrations for schema updates

### Environment Configuration
- **Server Variables**: DATABASE_URL, AI_API_KEY, EMAIL credentials
- **Client Variables**: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (if using Supabase)
- **Port Configuration**: Configurable via PORT environment variable

The application is designed to be deployed on platforms like Vercel, Railway, or similar services that support Node.js applications with PostgreSQL databases.