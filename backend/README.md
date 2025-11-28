# Backend - motoR API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure Supabase:
   - Go to https://supabase.com
   - Create a new project
   - Copy your project URL and keys to `.env`

4. Create database tables (run in Supabase SQL Editor):
```sql
-- Users table
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

5. Start development server:
```bash
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout

### Users
- `GET /users/me` - Get current user (requires auth)
- `PUT /users/me` - Update profile (requires auth)
- `GET /users/:id` - Get user by ID (requires auth)

## Testing

Use a tool like Postman or curl:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```
