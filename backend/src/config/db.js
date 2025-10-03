import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
