const mongoose = require('mongoose');

// Cache the connection across serverless function warm invocations
let cached = global._mongoConnection;
if (!cached) {
  cached = global._mongoConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // Already connected — reuse the existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // Connection in progress — wait for it
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000, // 10s to find a server
      socketTimeoutMS: 45000,          // 45s socket timeout
      maxPoolSize: 10,                 // limit connections in serverless
    };

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((err) => {
        cached.promise = null; // allow retry on next request
        console.error(`❌ MongoDB Connection Failed: ${err.message}`);
        throw err; // let the request fail gracefully — no process.exit
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;

