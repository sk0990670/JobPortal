const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const app = require('./app');
const { init } = require('./socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize socket.io
init(server);

server.listen(PORT, () => {
  console.log(`\n🚀 JobPortal Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});
