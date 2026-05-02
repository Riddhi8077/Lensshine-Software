const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("📍 URI:", process.env.MONGODB_URI?.replace(/:[^:]*@/, ":***@"));

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected:", conn.connection.host);
    console.log("📦 Database:", conn.connection.db.databaseName);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("📋 Details:", err.reason || err);
    process.exit(1);
  }
};

module.exports = connectDB;
