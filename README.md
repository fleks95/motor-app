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
├── mobile/           # React Native (Expo) - Web + Mobile
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

### Mobile/Web Setup

```bash
cd mobile
npm install
npm start
```

Then:
- Press `w` for web
- Press `a` for Android (requires Android Studio)
- Press `i` for iOS (requires Xcode on macOS)

## Development

- Backend runs on `http://localhost:3000`
- Mobile dev server runs on `http://localhost:8081`
- Web dev server runs on `http://localhost:8081`

## Deployment (Future)

- Backend: Local server (24/7)
- Mobile: App Store / Google Play
- Web: Static hosting (Netlify/Vercel) or served from backend

## Documentation

See `docs/` folder for:
- `PRD.md` - Product Requirements Document
- `ARCHITECTURE.md` - Technical Architecture Specification
