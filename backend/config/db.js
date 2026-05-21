const mongoose = require('mongoose');

// Cache the connection across serverless function warm invocations
let cached = global._mongoConnection;
if (!cached) {
  cached = global._mongoConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Guard: fail fast with a clear message if env var is missing
  if (!process.env.MONGO_URI) {
    throw new Error(
      'MONGO_URI is not defined. Please set it in your Vercel project environment variables.'
    );
  }

  // Already connected and connection is still alive — reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Reset stale connection so we reconnect cleanly
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  // Connection in progress — wait for it
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 15000, // 15s to find a server (generous for Vercel cold start)
      socketTimeoutMS: 45000,          // 45s socket timeout
      connectTimeoutMS: 15000,         // 15s to establish connection
      maxPoolSize: 5,                  // Keep pool small in serverless environment
      minPoolSize: 0,
      maxIdleTimeMS: 10000,            // Close idle connections after 10s
      bufferCommands: false,           // Disable mongoose command buffering
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log(`✅ MongoDB Connected: ${mongooseInstance.connection.host}`);
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // Allow retry on next request
        cached.conn = null;
        console.error(`❌ MongoDB Connection Failed: ${err.message}`);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
