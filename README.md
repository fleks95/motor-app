# motoR - Motorcycle Routes App

A cross-platform application for discovering, planning, and sharing motorcycle routes.

## Tech Stack

- **Frontend**: React Native (Expo) - Web, iOS, Android from single codebase
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Email/Password (social logins planned)

## Project Structure

```
motoR/
├── backend/          # Node.js/Express API server
├── frontend/         # React Native (Expo) - Web, iOS, Android
├── docs/             # Documentation (PRD, Architecture)
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Git

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Then:

- Press `w` for web
- Press `a` for Android (requires Android Studio)
- Press `i` for iOS (requires Xcode on macOS)

## Development

- Backend runs on `http://localhost:3000`
- Frontend dev server runs on `http://localhost:8081`
- Web dev server runs on `http://localhost:8081`

## Deployment (Future)

- Backend: Local server (24/7)
- Frontend: App Store / Google Play (mobile) + Static hosting (web)
- Web: Static hosting (Netlify/Vercel) or served from backend

## Documentation

See `docs/` folder for:

- `PRD.md` - Product Requirements Document
- `ARCHITECTURE.md` - Technical Architecture Specification
