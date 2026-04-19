require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🚀 JobPortal API Server Running        ║
║   Port    : ${PORT}                          ║
║   Env     : ${process.env.NODE_ENV || 'development'}                  ║
║   API URL : http://localhost:${PORT}/api/v1 ║
╚══════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('⚠️  Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer();
