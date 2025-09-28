import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing customers (optional)
    await User.deleteMany({ role: "customer" });

    // Define demo customers
    const customers = [
      {
        name: "Aarav Customer",
        email: "aarav@test.com",
        password: await bcrypt.hash("pass123", 10),
        role: "customer",
        phone: "9991112222"
      },
      {
        name: "Riya Customer",
        email: "riya@test.com",
        password: await bcrypt.hash("pass123", 10),
        role: "customer",
        phone: "9992223333"
      }
    ];

    // Insert into DB
    await User.insertMany(customers);

    console.log("✅ Demo customers seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedUsers();
