# Architecture Specification

## motoR - Technical Architecture

**Version:** 1.0  
**Date:** November 28, 2025  
**Author:** Technical Team

---

## 1. Overview

This document describes the technical architecture for the motoR motorcycle routes application, including technology stack, system design, data models, and deployment strategy.

---

## 2. Architecture Goals

- **Cross-platform:** Single codebase for Web, iOS, and Android
- **Scalable:** Handle growth from 100 to 100,000+ users
- **Maintainable:** Clean code structure, modern tooling
- **Cost-effective:** Leverage free tiers, minimize infrastructure costs
- **Secure:** Industry-standard authentication and data protection
- **Performant:** Fast load times, smooth user experience

---

## 3. Technology Stack

### 3.1 Frontend

**Framework:** React Native (Expo)

**Rationale:**
- Single codebase for iOS, Android, and Web
- Large ecosystem and community support
- Expo simplifies development and deployment
- Built-in support for navigation, maps, camera, etc.

**Key Dependencies:**
- `expo` - SDK and development tools
- `react-navigation` - Navigation library
- `react-native-maps` (future) - Map integration
- `expo-location` (future) - GPS/location services
- `@supabase/supabase-js` - Database and auth client

**UI Framework:**
- React Native Paper or NativeBase (TBD with designer)
- Custom components as needed

### 3.2 Backend

**Framework:** Node.js + Express

**Rationale:**
- JavaScript across full stack (easier context switching)
- Large ecosystem of packages
- Good performance for I/O-bound operations
- Easy to deploy and maintain

**Key Dependencies:**
- `express` - Web framework
- `@supabase/supabase-js` - Supabase client
- `jsonwebtoken` - JWT token generation/verification
- `bcrypt` - Password hashing
- `express-validator` - Input validation
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `rate-limiter-flexible` - Rate limiting

### 3.3 Database

**Database:** PostgreSQL via Supabase

**Rationale:**
- Free tier includes 500 MB database + 2 GB bandwidth
- Built-in authentication system
- Real-time subscriptions (future feature)
- Easy social login integration
- Row Level Security (RLS) for data protection
- Hosted, managed service (no server maintenance)

**Alternative Considered:**
- MongoDB Atlas - Good, but PostgreSQL better for relational data (routes, users, relationships)

### 3.4 Authentication

**Strategy:** JWT (JSON Web Tokens) + Supabase Auth

**Flow:**
1. User submits email/password to backend
2. Backend validates credentials via Supabase
3. Backend generates JWT token
4. Client stores token (secure storage)
5. Client includes token in Authorization header for API requests
6. Backend verifies token on protected routes

**Token Storage:**
- Mobile: Expo SecureStore
- Web: HttpOnly cookies (preferred) or localStorage

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────┐
│           Client Layer                   │
│  ┌────────┬──────────┬───────────┐     │
│  │  Web   │   iOS    │  Android  │     │
│  └────────┴──────────┴───────────┘     │
│       (React Native + Expo)             │
└─────────────┬───────────────────────────┘
              │ HTTPS/REST API
              │
┌─────────────▼───────────────────────────┐
│         API Layer (Backend)              │
│     Node.js + Express Server             │
│  ┌─────────────────────────────────┐   │
│  │ Routes  │ Auth  │ Middleware    │   │
│  └─────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │ Supabase Client SDK
              │
┌─────────────▼───────────────────────────┐
│       Data Layer (Supabase)              │
│  ┌──────────────┬───────────────────┐  │
│  │ PostgreSQL   │  Auth Service     │  │
│  │   Database   │  (User mgmt)      │  │
│  └──────────────┴───────────────────┘  │
└──────────────────────────────────────────┘
```

### 4.2 Frontend Architecture

```
mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/
│   │   ├── login.tsx      # Login screen
│   │   └── register.tsx   # Registration screen
│   ├── (tabs)/            # Main app tabs (future)
│   │   ├── home.tsx
│   │   ├── routes.tsx
│   │   └── profile.tsx
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── LoadingSpinner.tsx
├── services/              # API and business logic
│   ├── auth.service.ts
│   └── api.service.ts
├── hooks/                 # Custom React hooks
│   └── useAuth.ts
├── types/                 # TypeScript types
│   └── index.ts
├── constants/             # App constants
│   └── config.ts
└── utils/                 # Helper functions
    └── validation.ts
```

### 4.3 Backend Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Supabase client setup
│   │   └── env.js            # Environment config
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   ├── errorHandler.js   # Error handling
│   │   ├── validation.js     # Input validation
│   │   └── rateLimiter.js    # Rate limiting
│   ├── routes/
│   │   ├── auth.routes.js    # Auth endpoints
│   │   └── user.routes.js    # User endpoints
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── services/
│   │   ├── auth.service.js   # Auth business logic
│   │   └── user.service.js
│   ├── models/               # Data models/types
│   │   └── user.model.js
│   └── app.js                # Express app setup
├── server.js                 # Entry point
└── package.json
```

---

## 5. Data Models

### 5.1 Database Schema (PostgreSQL)

#### Users Table
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

#### Routes Table (Future)
```sql
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  distance_km DECIMAL(10, 2),
  elevation_gain INT,
  difficulty VARCHAR(20), -- easy, moderate, hard
  is_public BOOLEAN DEFAULT true,
  route_data JSONB, -- GeoJSON format
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_routes_public ON routes(is_public);
```

#### Sessions Table (Optional - for token blacklisting)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

### 5.2 API Data Transfer Objects (DTOs)

#### Authentication DTOs
```typescript
// Login Request
interface LoginRequest {
  email: string;
  password: string;
}

// Login Response
interface LoginResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    username: string;
    avatar_url: string;
  };
  token: string;
  expiresIn: number;
}

// Register Request
interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  username?: string;
}
```

---

## 6. API Design

### 6.1 REST API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

#### Authentication Endpoints

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
```

#### User Endpoints

```
GET    /users/me          # Get current user profile
PUT    /users/me          # Update current user profile
DELETE /users/me          # Delete account
GET    /users/:id         # Get user by ID (public profile)
```

#### Routes Endpoints (Future)

```
GET    /routes            # List routes (with filters)
POST   /routes            # Create route
GET    /routes/:id        # Get route details
PUT    /routes/:id        # Update route
DELETE /routes/:id        # Delete route
GET    /routes/search     # Search routes
```

### 6.2 Request/Response Examples

#### POST /auth/login

**Request:**
```json
{
  "email": "rider@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "rider@example.com",
      "full_name": "John Rider",
      "username": "johnrider",
      "avatar_url": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### 6.3 Authentication Flow

1. User enters email/password on login screen
2. Frontend sends POST to `/api/v1/auth/login`
3. Backend validates credentials against Supabase
4. Backend generates JWT token (24h expiry)
5. Backend returns user data + token
6. Frontend stores token securely
7. Frontend includes token in subsequent requests: `Authorization: Bearer <token>`
8. Backend middleware verifies token on protected routes

---

## 7. Security

### 7.1 Authentication Security

- Passwords hashed with bcrypt (cost factor: 12)
- JWT tokens signed with strong secret (256-bit minimum)
- Token expiration: 24 hours (configurable)
- Refresh tokens for extended sessions (future)
- Rate limiting on auth endpoints (5 requests/minute)

### 7.2 API Security

- HTTPS enforced in production
- CORS configured for specific origins
- Helmet.js for security headers
- Input validation on all endpoints
- SQL injection prevention (parameterized queries via Supabase)
- XSS prevention (input sanitization)

### 7.3 Data Security

- Row Level Security (RLS) in Supabase
- Users can only access their own data
- Password fields never returned in API responses
- Environment variables for sensitive config

---

## 8. Deployment Strategy

### 8.1 Development Environment

- Local development with hot reload
- Expo Go app for mobile testing
- Web browser for web testing
- Backend runs locally on port 3000
- Supabase cloud instance (free tier)

### 8.2 Production Deployment (Future)

#### Backend
- **Server:** Local server (user's machine) running 24/7
- **OS:** Linux (Ubuntu) recommended, or Windows Server
- **Process Manager:** PM2 for auto-restart
- **Reverse Proxy:** Nginx for HTTPS and static files
- **SSL:** Let's Encrypt (free certificates)
- **Port:** Backend on 3000, Nginx on 80/443

#### Frontend (Mobile)
- **iOS:** Submit to App Store via Expo EAS Build
- **Android:** Submit to Google Play via Expo EAS Build
- **Web:** Build static bundle, serve via Nginx or deploy to Vercel/Netlify

#### Database
- **Supabase:** Cloud-hosted, no deployment needed
- Monitor usage, upgrade tier if needed

### 8.3 CI/CD (Future)

- GitHub Actions for automated testing
- Automated builds on push to main branch
- Expo EAS for mobile app builds and OTA updates

---

## 9. Performance Considerations

### 9.1 Frontend Performance

- Code splitting (via Expo Router)
- Image optimization and lazy loading
- Memoization for expensive computations
- Virtual lists for long scrollable content (routes list)

### 9.2 Backend Performance

- Database query optimization (indexes)
- Response caching (Redis, future)
- Compression middleware (gzip)
- Connection pooling (Supabase handles this)

### 9.3 Mobile Performance

- Minimize bundle size
- Optimize images (WebP format)
- Use native modules where appropriate
- Profile with React DevTools

---

## 10. Monitoring & Logging

### 10.1 Application Logging

- Structured logging (Winston or Pino)
- Log levels: ERROR, WARN, INFO, DEBUG
- Log to file and console
- Rotate logs daily

### 10.2 Error Tracking (Future)

- Sentry for error monitoring
- Track crashes and exceptions
- User feedback on errors

### 10.3 Analytics (Future)

- User behavior analytics (Mixpanel or Amplitude)
- Track key events (login, route creation, navigation)
- Monitor user retention and engagement

---

## 11. Testing Strategy

### 11.1 Unit Tests

- Jest for JavaScript/TypeScript
- Test services and utilities
- Target: 70%+ code coverage

### 11.2 Integration Tests

- Supertest for API endpoint testing
- Test authentication flows
- Test database operations

### 11.3 End-to-End Tests (Future)

- Detox for React Native
- Test critical user flows
- Run on CI/CD pipeline

---

## 12. Development Workflow

### 12.1 Git Workflow

- `main` branch: production-ready code
- `develop` branch: integration branch
- Feature branches: `feature/login-screen`
- Commit messages: Conventional Commits format

### 12.2 Code Quality

- ESLint + Prettier for code formatting
- TypeScript for type safety
- Pre-commit hooks (Husky)
- Code reviews before merge

---

## 13. Scalability Considerations

### 13.1 Current Scale (MVP)
- 100-1,000 users
- Supabase free tier sufficient
- Single backend server

### 13.2 Future Scale (Growth)
- 10,000+ users
- Upgrade Supabase tier or migrate to managed PostgreSQL
- Load balancer + multiple backend instances
- CDN for static assets
- Redis for caching and sessions

---

## 14. Dependencies & Third-Party Services

| Service | Purpose | Cost |
|---------|---------|------|
| Supabase | Database + Auth | Free (500 MB DB) |
| Expo | Mobile development | Free (EAS Build has limits) |
| Let's Encrypt | SSL certificates | Free |
| GitHub | Code hosting | Free |

**Future:**
- Google Maps API (or Mapbox) for mapping
- AWS S3 / Cloudinary for image hosting
- Sentry for error tracking
- SendGrid for transactional emails

---

## 15. Open Technical Questions

1. Should we implement refresh tokens or rely on token expiration + re-login?
2. What map provider (Google Maps, Mapbox, OpenStreetMap)?
3. How to handle offline route caching efficiently?
4. Should we use WebSockets for real-time features (group rides)?
5. What's the strategy for mobile app updates (OTA vs app store)?

---

## 16. Migration & Versioning

### API Versioning
- Version in URL: `/api/v1/`
- Maintain backward compatibility for at least 6 months
- Deprecation warnings in responses

### Database Migrations
- Use migration tool (e.g., node-pg-migrate or Supabase migrations)
- Version control all migrations
- Test migrations on staging before production

---

## 17. Appendix

### 17.1 Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx
JWT_SECRET=your-secret-key-256-bit
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:8081
```

#### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

### 17.2 Useful Commands

```bash
# Backend
npm run dev          # Start dev server with nodemon
npm run start        # Start production server
npm test             # Run tests
npm run lint         # Run ESLint

# Frontend
npm start            # Start Expo dev server
npm run web          # Start web
npm run android      # Start Android
npm run ios          # Start iOS
npm run build:web    # Build web production bundle
```

---

**Document End**
