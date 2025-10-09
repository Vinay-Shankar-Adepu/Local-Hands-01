// Quick script to check users in database
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const totalUsers = await User.countDocuments();
    console.log('\n📊 Total users in database:', totalUsers);
    
    const users = await User.find({}).select('email role name createdAt').sort('-createdAt').limit(30);
    
    console.log('\n👥 Users found:');
    console.log('─'.repeat(80));
    users.forEach((u, i) => {
      console.log(`${i+1}. ${u.email?.padEnd(30)} | ${u.role?.padEnd(10)} | ${u.name || 'N/A'}`);
    });
    
    // Check for specific users
    console.log('\n🔍 Checking for specific users:');
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    const user1 = await User.findOne({ email: '1@gmail.com' });
    const user2 = await User.findOne({ email: '2@gmail.com' });
    
    console.log('admin@gmail.com:', admin ? `✅ Found (role: ${admin.role})` : '❌ Not found');
    console.log('1@gmail.com:', user1 ? `✅ Found (role: ${user1.role})` : '❌ Not found');
    console.log('2@gmail.com:', user2 ? `✅ Found (role: ${user2.role})` : '❌ Not found');
    
    // Check collections
    console.log('\n📦 Collections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(c => console.log('-', c.name));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
