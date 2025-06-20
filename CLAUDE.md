# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a lightweight, cloud-based issue tracking system for small teams. The application provides a two-page workflow: users submit issue reports, and technicians review and resolve them in a centralized dashboard.

## Architecture

- **Frontend**: React.js SPA with react-router-dom
- **Backend**: Node.js + Express.js REST API
- **Database**: PostgreSQL (Supabase/Railway) or SQLite
- **Deployment**: Frontend on Vercel/Netlify, Backend on Railway/Render

## Technology Stack

### Frontend Dependencies
- `react-router-dom` for navigation
- `axios` for API calls
- `date-fns` for date handling
- `react-hook-form` for form validation

### Backend Dependencies
- `cors` for cross-origin requests
- `helmet` for security headers
- `express-rate-limit` for DDoS protection
- `joi` or `zod` for request validation
- `prisma` as ORM (if using PostgreSQL)

## Database Schema

Single `issues` table with fields:
- User submission: `user_name`, `issue_date`, `issue_description`, `preceding_events`, `resolution_steps`
- Technician fields: `technician_name`, `technician_notes`, `is_resolved`
- Timestamps: `created_at`, `updated_at`

## API Endpoints

```
GET    /api/issues           # Get all issues with pagination
POST   /api/issues           # Create new issue
GET    /api/issues/:id       # Get specific issue
PUT    /api/issues/:id       # Update entire issue
PATCH  /api/issues/:id/tech  # Update only technician fields
DELETE /api/issues/:id       # Delete issue (optional)
```

## Frontend Structure

```
src/
├── components/
│   ├── IssueForm.jsx          # Issue submission form
│   ├── IssueList.jsx          # Technician dashboard
│   ├── IssueCard.jsx          # Individual issue display
│   ├── TechnicianPanel.jsx    # Technician update section
│   └── common/                # Shared components
├── hooks/
│   ├── useIssues.js           # Issue CRUD operations
│   └── useLocalStorage.js     # Draft saving
├── services/
│   └── api.js                 # API calls
├── utils/
│   ├── validation.js          # Form validation
│   └── dateHelpers.js         # Date formatting
└── App.jsx                    # Main routing
```

## Security Configuration

- Rate limiting: 5 issues per 15 minutes per IP
- Input sanitization for XSS prevention
- Parameterized queries for SQL injection prevention
- CORS configuration for production domains

## Environment Variables

Backend:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port
- `CORS_ORIGIN`: Frontend domain for CORS

Frontend:
- `REACT_APP_API_URL`: Backend API endpoint

## Development Commands

- `npm install` - Install root dependencies and trigger install-all
- `npm run install-all` - Install dependencies for root, backend, and frontend
- `npm run dev` - Start both backend and frontend concurrently
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build frontend for production
- `npm start` - Start backend in production mode

## Deployment Strategy

- **Free Tier**: Railway (backend) + Vercel (frontend) + Supabase (database)
- **Paid Upgrade**: Railway Pro ($5/month) + Supabase Pro ($25/month)
- Target capacity: 10 users, 100 entries initially