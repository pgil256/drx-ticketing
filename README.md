# DRX Issue Tracking System

A lightweight, cloud-based issue tracking system designed for small teams and organizations.

## Features

- User-friendly issue submission form
- Centralized technician dashboard
- Real-time updates and persistent data storage
- Responsive design for desktop and mobile

## Quick Start

### Option 1: Quick Setup (Recommended)
```bash
npm install
npm run install-deps
npm run dev
```

### Option 2: Manual Setup
```bash
# Install dependencies for each part
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm install

# Start both backend and frontend
npm run dev
```

### Option 3: Individual Components
```bash
# Backend only
cd backend && npm install && npm run dev

# Frontend only  
cd frontend && npm install && npm start
```

The backend runs on `http://localhost:3001` and frontend on `http://localhost:3000`.

## Architecture

- **Frontend**: React.js SPA
- **Backend**: Node.js + Express.js REST API
- **Database**: SQLite (development) / PostgreSQL (production)

## API Endpoints

- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get specific issue
- `PUT /api/issues/:id` - Update entire issue
- `PATCH /api/issues/:id/tech` - Update technician fields
- `DELETE /api/issues/:id` - Delete issue

## Deployment

See deployment configuration in the respective frontend and backend directories.