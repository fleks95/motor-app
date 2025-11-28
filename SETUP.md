# Setup Instructions

## Prerequisites

You'll need to install Node.js before you can run this project:

1. **Download Node.js**:
   - Go to https://nodejs.org/
   - Download the **LTS version** (recommended for most users)
   - Current LTS is v20.x

2. **Install Node.js**:
   - Run the installer you downloaded
   - Follow the installation prompts
   - Make sure "Add to PATH" is checked
   - **Important**: Restart your computer (or at minimum, close and reopen VS Code and all terminals)

3. **Verify Installation**:
   After restarting, open a new terminal and run:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.11.0 and 10.2.4)

## Quick Start (After Node.js Installation)

### 1. Setup Supabase (Free Database)

1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
3. Fill in project details:
   - Name: `motor-app`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)
5. Go to Project Settings > API
6. Copy these values for later:
   - Project URL
   - anon/public key
   - service_role key (keep secret!)

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your Supabase credentials:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=change-this-to-a-random-string-at-least-32-characters-long
```

Create the database table in Supabase:
1. Go to Supabase Dashboard > SQL Editor
2. Run this SQL:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  bike_model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

Start the backend:
```bash
npm run dev
```

Backend will run on http://localhost:3000

### 3. Setup Mobile App

```bash
cd mobile
npm install
cp .env.example .env
```

Edit `mobile/.env` with your Supabase credentials (same as backend).

Start the app:
```bash
npm start
```

Then press `w` to open in web browser.

## Project Structure

```
motoR/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── config/
│   └── server.js
│
├── mobile/            # React Native (Expo) app
│   ├── app/           # Screens (login, register, home)
│   ├── src/
│   │   ├── contexts/  # Auth state management
│   │   └── services/  # API calls
│   └── package.json
│
└── docs/              # Documentation
    ├── PRD.md         # Product requirements
    └── ARCHITECTURE.md # Technical specs
```

## What's Included

### ✅ Completed Features

- Full authentication system (register, login, logout)
- Secure password hashing
- JWT token-based auth
- Cross-platform app (Web, iOS, Android from one codebase)
- Auto-login on app restart
- Clean, minimal UI
- Complete documentation (PRD & Architecture)

### 🚧 Next Steps (To Be Implemented)

- Route creation and management
- Map integration (Google Maps or Mapbox)
- GPS navigation
- Social features (following, likes, comments)
- Profile customization
- Complete design system (waiting for designer)

## Testing the App

1. Start backend: `cd backend && npm run dev`
2. Start mobile: `cd mobile && npm start` (then press `w` for web)
3. Create an account on the register screen
4. Log in with your new account
5. You'll see a welcome screen (placeholder for future features)

## Troubleshooting

### Node.js not found
- Make sure you installed Node.js and restarted your terminal/computer
- Try running in a completely new terminal window

### Port already in use
- Backend uses port 3000, mobile uses 8081
- If either is in use, you can change them in the config files

### Cannot connect to backend from phone
- If testing on a physical device (not web)
- Change `localhost` in `mobile/.env` to your computer's IP address
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Supabase errors
- Double-check your credentials in both `.env` files
- Make sure you created the `users` table in Supabase SQL Editor

## Development Workflow

1. Backend runs on http://localhost:3000
2. Mobile dev server runs on http://localhost:8081
3. Make changes to files - they hot-reload automatically
4. Backend needs manual restart if you change `.env` file

## Deployment (Future)

See `ARCHITECTURE.md` for detailed deployment plans:
- Backend: Local server (24/7)
- Mobile: App Store + Google Play
- Web: Can be hosted on Vercel/Netlify or served from backend

## Need Help?

- Check `backend/README.md` for backend-specific details
- Check `mobile/README.md` for mobile-specific details
- Review `docs/ARCHITECTURE.md` for technical deep dive
- Review `docs/PRD.md` for product features and roadmap
