# Development Setup Guide

This document explains the development tools and practices configured for the motoR project.

## Prerequisites

- Node.js 18+ installed
- Git installed
- Environment variables configured (see `.env.example` files)

## Initial Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd .. && npm install  # Root for Husky

# Run environment validation
cd backend && npm start  # Will validate env vars before starting
```

## Git Hooks (Husky)

Git hooks automatically run checks before commits to maintain code quality.

### What Happens on Commit

1. **Lint-staged** runs on staged files only
2. **ESLint** fixes code issues automatically
3. **Prettier** formats code
4. If checks fail, the commit is blocked

### Bypassing Hooks (Not Recommended)

```bash
git commit --no-verify -m "message"  # Skip hooks (use sparingly!)
```

### Configuration

- `.husky/pre-commit` - Pre-commit hook script
- `lint-staged` config in root `package.json`

## Environment Variable Validation

The backend validates required environment variables on startup.

### What's Validated

- ✅ All required env vars are set
- ✅ JWT_SECRET is at least 32 characters
- ✅ SUPABASE_URL uses HTTPS
- ⚠️ Warns if using default secrets in production

### Location

- `backend/src/config/validateEnv.js` - Validation logic
- Called in `backend/server.js` before starting server

### Error Example

```
❌ Missing required environment variables:
   - JWT_SECRET
   - SUPABASE_URL

Please check your .env file and ensure all required variables are set.
```

## Testing

Both backend and frontend have Jest test suites with coverage reporting.

### Running Tests

```bash
# Run all tests (from root)
npm test

# Backend tests
cd backend
npm test              # Run with coverage
npm run test:watch    # Watch mode for development

# Frontend tests
cd frontend
npm test              # Run with coverage
npm run test:watch    # Watch mode
```

### Test Files

**Backend:**

- `backend/src/__tests__/api.test.js` - API endpoint tests
- `backend/src/__tests__/validateEnv.test.js` - Environment validation tests

**Mobile:**

- `mobile/src/__tests__/AuthContext.test.tsx` - Auth context tests
- `mobile/src/__tests__/api.service.test.ts` - API service tests

### Coverage Thresholds

- **Backend**: 40% (branches, functions, lines, statements)
- **Frontend**: 15-20% (branches, functions, lines, statements)

Coverage reports are generated in `coverage/` directories (gitignored).

### Writing New Tests

**Backend (Jest + Supertest):**

```javascript
const request = require('supertest');
const app = require('../app');

describe('Feature Name', () => {
  it('should do something', async () => {
    const response = await request(app).get('/endpoint');
    expect(response.status).toBe(200);
  });
});
```

**Frontend (Jest + React Native Testing Library):**

```typescript
import { render } from '@testing-library/react-native';

describe('Component', () => {
  it('should render', () => {
    const { getByText } = render(<Component />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

## Code Quality Tools

See [CODE_QUALITY.md](./CODE_QUALITY.md) for details on:

- ESLint configuration
- Prettier formatting
- VS Code integration
- Linting rules

## Continuous Integration (Future)

When adding CI/CD (GitHub Actions, etc.):

```yaml
# Example workflow steps
- run: npm install
- run: npm run lint
- run: npm test
- run: npm run format:check
```

## Troubleshooting

### Husky hooks not working

```bash
# Reinstall Husky hooks
npx husky install
```

### Tests failing locally

```bash
# Clear Jest cache
npx jest --clearCache

# Check if environment variables are set
cd backend && node -e "require('./src/config/validateEnv').validateEnv()"
```

### ESLint/Prettier conflicts

```bash
# Format and lint all files
npm run format
npm run lint:fix
```

## Best Practices

1. **Always run tests before pushing**: `npm test`
2. **Don't skip git hooks** unless absolutely necessary
3. **Keep tests fast** - mock external services
4. **Update tests when changing code** - maintain coverage
5. **Run environment validation** in all environments

## Scripts Reference

### Root Package.json

```bash
npm test        # Run tests in both backend and mobile
npm run lint    # Lint both projects
npm run format  # Format both projects
```

### Backend

```bash
npm start           # Start production server
npm run dev         # Start development server (nodemon)
npm test            # Run tests with coverage
npm run test:watch  # Watch mode
npm run lint        # Check for errors
npm run lint:fix    # Fix errors automatically
npm run format      # Format all files
```

### Frontend

```bash
npm start           # Start Expo
npm run web         # Start web version
npm run android     # Start Android
npm run ios         # Start iOS
npm test            # Run tests with coverage
npm run test:watch  # Watch mode
npm run lint        # Check for errors
npm run lint:fix    # Fix errors automatically
npm run format      # Format all files
```
