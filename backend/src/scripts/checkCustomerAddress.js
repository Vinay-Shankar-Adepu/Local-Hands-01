import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCustomerAddress() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const customer = await User.findOne({ email: 'customer@test.com' });
    
    if (!customer) {
      console.log('❌ Customer not found!');
      process.exit(1);
    }

    console.log('📋 Customer Details:');
    console.log('━'.repeat(50));
    console.log(`Name: ${customer.name}`);
    console.log(`Email: ${customer.email}`);
    console.log(`Role: ${customer.role}`);
    console.log(`\n📍 Address Information:`);
    console.log(`Address: ${customer.address || '(not set)'}`);
    console.log(`Precise Address: ${customer.preciseAddress || '(not set)'}`);
    
    if (customer.location && customer.location.coordinates) {
      console.log(`\n🗺️ Location Coordinates:`);
      console.log(`Longitude: ${customer.location.coordinates[0]}`);
      console.log(`Latitude: ${customer.location.coordinates[1]}`);
    } else {
      console.log(`\n🗺️ Location: (not set)`);
    }
    
    console.log(`\n📅 Last Updated: ${customer.updatedAt}`);
    console.log('━'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCustomerAddress();
