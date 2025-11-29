const { validateEnv } = require('./src/config/validateEnv');
const app = require('./src/app');
const config = require('./src/config/env');

// Validate environment variables before starting server
validateEnv();

const server = app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Server running on port ${config.port}`);
  // eslint-disable-next-line no-console
  console.log(`📝 Environment: ${config.env}`);
  // eslint-disable-next-line no-console
  console.log(`🔗 API: http://localhost:${config.port}/api/v1`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // eslint-disable-next-line no-console
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('HTTP server closed');
  });
});
