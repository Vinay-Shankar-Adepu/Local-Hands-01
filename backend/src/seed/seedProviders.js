import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedProviders = async () => {
  try {
    await connectDB();

    // Clear existing demo providers (optional, so you don't duplicate)
    await User.deleteMany({ email: /provider@test.com/ });

    // Demo providers with location + availability
    const providers = [
      {
        name: "Ramesh Provider",
        email: "ramesh.provider@test.com",
        password: await bcrypt.hash("pass123", 10),
        role: "provider",
        phone: "8881112222",
        verified: true,
        otpVerified: true,
        isAvailable: true,
        location: {
          type: "Point",
          coordinates: [78.4867, 17.3850] // Hyderabad
        }
      },
      {
        name: "Sita Provider",
        email: "sita.provider@test.com",
        password: await bcrypt.hash("pass123", 10),
        role: "provider",
        phone: "8882223333",
        verified: true,
        otpVerified: true,
        isAvailable: true,
        location: {
          type: "Point",
          coordinates: [78.4900, 17.3900] // Nearby Hyderabad
        }
      }
    ];

    await User.insertMany(providers);

    console.log("✅ Demo providers seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedProviders();
