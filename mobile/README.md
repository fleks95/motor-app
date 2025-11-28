# Mobile App - motoR

Cross-platform mobile application for iOS, Android, and Web.

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

## Setup

1. **Install Node.js** if not already installed:
   - Download from https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Run the installer and follow the prompts
   - Restart your terminal/command prompt after installation

2. **Install dependencies**:
```bash
cd mobile
npm install
```

3. **Create environment file**:
```bash
cp .env.example .env
```

4. **Configure environment variables** in `.env`:
   - Set `EXPO_PUBLIC_API_URL` to your backend URL
   - Set Supabase credentials (same as backend)

5. **Start the development server**:
```bash
npm start
```

## Running the App

After running `npm start`, you'll see options:

### Web
- Press `w` to open in web browser
- Most reliable for development without phone/emulator

### Mobile (iOS/Android)
- **Option 1 - Physical Device** (Easiest):
  1. Install "Expo Go" app from App Store or Google Play
  2. Scan the QR code shown in terminal
  
- **Option 2 - Emulator**:
  - Android: Requires Android Studio
  - iOS: Requires Xcode (macOS only)

## Project Structure

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx        # Root layout with auth provider
│   ├── index.tsx          # Entry point / splash
│   ├── login.tsx          # Login screen
│   ├── register.tsx       # Register screen
│   └── (tabs)/            # Main app (after login)
│       ├── _layout.tsx
│       └── home.tsx
├── src/
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── services/          # API services
│   │   ├── api.service.ts
│   │   └── auth.service.ts
│   └── config/
│       └── supabase.ts
└── package.json
```

## Available Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Open on Android
- `npm run ios` - Open on iOS (macOS only)
- `npm run web` - Open in web browser

## Features

### Current
- ✅ User registration
- ✅ User login
- ✅ Secure token storage
- ✅ Auto-login on app restart
- ✅ Logout functionality
- ✅ Works on Web, iOS, Android

### Coming Soon
- Route discovery and creation
- Map integration
- GPS navigation
- Social features

## Troubleshooting

### "npx not recognized" or "node not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Network request failed"
- Ensure backend server is running on `http://localhost:3000`
- Check `.env` file has correct API URL
- For mobile device: Use your computer's IP address instead of localhost

### App won't load on phone
- Ensure phone and computer are on same WiFi network
- Check firewall isn't blocking port 8081

## Testing Backend Connection

You can test if the backend is running:
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"OK","timestamp":"..."}`

## Building for Production (Future)

When ready to deploy:

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

See Expo documentation for detailed build instructions.
