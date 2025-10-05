import dotenv from "dotenv";
import mongoose from "mongoose";
import Service from "../models/Service.js";
import ServiceTemplate from "../models/ServiceTemplate.js";
import Category from "../models/Category.js";
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
        password: "hashedpassword",
        role: "provider",
        verified: true,
        isAvailable: true
      });
      console.log("✅ Created default provider:", provider.email);
    }

    // (2) Create Categories with emojis
    await Category.deleteMany({});
    
    const categories = await Category.insertMany([
      { name: "🏠 Home Services", slug: "home-services", active: true },
      { name: "💇 Personal Services", slug: "personal-services", active: true },
      { name: "🚗 Automotive Services", slug: "automotive-services", active: true },
      { name: "💻 Technology & Appliances", slug: "technology-appliances", active: true },
      { name: "🎉 Events & Catering", slug: "events-catering", active: true }
    ]);

    console.log("✅ Categories created:", categories.length);

    const homeServicesId = categories[0]._id;
    const personalServicesId = categories[1]._id;
    const automotiveId = categories[2]._id;
    const techId = categories[3]._id;
    const eventsId = categories[4]._id;

    // (3) Create ALL Service Templates (20 total)
    await ServiceTemplate.deleteMany({});
    
    const templates = await ServiceTemplate.insertMany([
      // 🏠 Home Services (5)
      { name: "House Cleaning", category: homeServicesId, defaultPrice: 300, active: true },
      { name: "Plumbing", category: homeServicesId, defaultPrice: 200, active: true },
      { name: "Electrical", category: homeServicesId, defaultPrice: 250, active: true },
      { name: "Carpentry", category: homeServicesId, defaultPrice: 350, active: true },
      { name: "Painting", category: homeServicesId, defaultPrice: 500, active: true },
      
      // 💇 Personal Services (2)
      { name: "Salon", category: personalServicesId, defaultPrice: 150, active: true },
      { name: "Spa", category: personalServicesId, defaultPrice: 800, active: true },
      
      // 🚗 Automotive Services (3)
      { name: "Vehicle Towing", category: automotiveId, defaultPrice: 400, active: true },
      { name: "Car Repair", category: automotiveId, defaultPrice: 600, active: true },
      { name: "Bike Repair", category: automotiveId, defaultPrice: 200, active: true },
      
      // 💻 Technology & Appliances (6)
      { name: "Mobile Repair", category: techId, defaultPrice: 250, active: true },
      { name: "Laptop/Desktop Repair", category: techId, defaultPrice: 400, active: true },
      { name: "AC Repair & Installation", category: techId, defaultPrice: 500, active: true },
      { name: "Refrigerator/Washing Machine Repair", category: techId, defaultPrice: 450, active: true },
      { name: "CCTV Installation", category: techId, defaultPrice: 600, active: true },
      { name: "Smart Home Setup", category: techId, defaultPrice: 1000, active: true },
      
      // 🎉 Events & Catering (4)
      { name: "Photography", category: eventsId, defaultPrice: 2000, active: true },
      { name: "Catering", category: eventsId, defaultPrice: 1500, active: true },
      { name: "Music", category: eventsId, defaultPrice: 1200, active: true },
      { name: "Home Decoration", category: eventsId, defaultPrice: 800, active: true }
    ]);

    console.log("✅ Service templates created:", templates.length);

    // (4) Create sample services from templates for the test provider
    const sampleServices = [
      { 
        name: "House Cleaning", 
        category: "Home Services", 
        price: 300, 
        duration: "2 hrs", 
        provider: provider._id,
        template: templates[0]._id,
        lockedPrice: true,
        lat: 12.9716,
        lng: 77.5946
      },
      { 
        name: "Plumbing", 
        category: "Home Services", 
        price: 200, 
        duration: "1 hr", 
        provider: provider._id,
        template: templates[1]._id,
        lockedPrice: true,
        lat: 12.9716,
        lng: 77.5946
      },
      { 
        name: "AC Repair & Installation", 
        category: "Technology & Appliances", 
        price: 500, 
        duration: "1-2 hrs", 
        provider: provider._id,
        template: templates[12]._id,
        lockedPrice: true,
        lat: 12.9716,
        lng: 77.5946
      }
    ];

    // (5) Insert into DB (clear old first)
    await Service.deleteMany({});
    await Service.insertMany(sampleServices);

    console.log("✅ Sample provider services created:", sampleServices.length);
    console.log("✅ Full catalog seeded successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("   - 5 Categories");
    console.log("   - 20 Service Templates");
    console.log("   - 3 Sample Provider Services");
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    console.error(err);
    process.exit(1);
  }
};

seedServices();
