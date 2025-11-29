# Code Quality Setup

This project uses ESLint and Prettier to maintain code quality and consistent formatting.

## Tools

- **ESLint**: Linting for JavaScript and TypeScript
- **Prettier**: Code formatting
- **VS Code**: Automatic formatting on save

## Configuration Files

### Backend (JavaScript)

- `.eslintrc.json` - ESLint configuration
- `.prettierrc.json` - Prettier configuration
- `.prettierignore` - Files to exclude from formatting

### Mobile (TypeScript/React Native)

- `eslint.config.mjs` - ESLint 9 flat config
- `.prettierrc.json` - Prettier configuration
- `.prettierignore` - Files to exclude from formatting

### Workspace

- `.vscode/settings.json` - VS Code auto-format settings
- `.prettierrc.json` - Root Prettier config

## NPM Scripts

### Backend

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are formatted
```

### Mobile

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are formatted
```

## Rules

### Common Rules

- Single quotes for strings
- Semicolons required
- 2 spaces for indentation
- 100 character line width
- Trailing commas in ES5 style
- Console.log warnings (except console.error)
- Unused variables as warnings (allow \_ prefix for intentionally unused)

### Backend-Specific

- Node.js environment
- ES2021 features
- CommonJS modules

### Mobile-Specific

- TypeScript strict type checking
- React/React Native rules
- No console statements (except console.error)
- React in JSX scope not required (React 19)
- PropTypes not required (using TypeScript)

## VS Code Integration

The workspace is configured to:

- Format files automatically on save
- Run ESLint fixes on save
- Use Prettier as the default formatter

Make sure you have the following VS Code extensions installed:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Pre-commit Checks

Before committing code, run:

```bash
# Check backend
cd backend
npm run lint
npm run format:check

# Check frontend
cd frontend
npm run lint
npm run format:check
```

## Fixing Issues

Most issues can be auto-fixed:

```bash
cd backend && npm run lint:fix && npm run format
cd frontend && npm run lint:fix && npm run format
```
