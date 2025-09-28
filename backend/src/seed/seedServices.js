import dotenv from "dotenv";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

const seedServices = async () => {
  try {
    await connectDB();

    // (1) Find a provider (or create one if none exists)
    let provider = await User.findOne({ role: "provider" });
    if (!provider) {
      provider = await User.create({
        name: "Test Provider",
        email: "provider@test.com",
        password: "hashedpassword", // not used in login
        role: "provider",
        verified: true,
        isAvailable: true
      });
      console.log("✅ Created default provider:", provider.email);
    }

    // (2) Define services
    const services = [
      { name: "Bike Ride", category: "transport", price: 50, duration: "15 min", provider: provider._id },
      { name: "Car Ride", category: "transport", price: 150, duration: "30 min", provider: provider._id },
      { name: "House Cleaning", category: "home", price: 300, duration: "2 hrs", provider: provider._id },
      { name: "Plumbing", category: "repair", price: 200, duration: "1 hr", provider: provider._id }
    ];

    // (3) Insert into DB (clear old first)
    await Service.deleteMany({});
    await Service.insertMany(services);

    console.log("✅ Services seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedServices();
