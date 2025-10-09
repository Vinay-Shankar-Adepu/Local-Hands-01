// Restore missing users (1@gmail.com, 2@gmail.com, etc.)
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

async function restoreUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const usersToRestore = [
      { email: '1@gmail.com', name: 'Provider One', role: 'provider', password: 'pass123', 
        location: { type: 'Point', coordinates: [77.5900, 12.9700] }, isAvailable: true },
      { email: '2@gmail.com', name: 'Provider Two', role: 'provider', password: 'pass123',
        location: { type: 'Point', coordinates: [77.5920, 12.9720] }, isAvailable: true },
      { email: '3@gmail.com', name: 'Provider Three', role: 'provider', password: 'pass123',
        location: { type: 'Point', coordinates: [77.5880, 12.9680] }, isAvailable: true },
      { email: '4@gmail.com', name: 'Provider Four', role: 'provider', password: 'pass123',
        location: { type: 'Point', coordinates: [77.5950, 12.9750] }, isAvailable: true },
      { email: 'customer@test.com', name: 'Test Customer', role: 'customer', password: 'pass123' },
      { email: 'provider@test.com', name: 'Test Provider', role: 'provider', password: 'pass123',
        location: { type: 'Point', coordinates: [77.5900, 12.9700] }, isAvailable: true },
    ];
    
    console.log('🔄 Restoring users...\n');
    
    for (const userData of usersToRestore) {
      const existing = await User.findOne({ email: userData.email });
      
      if (existing) {
        console.log(`⏭️  ${userData.email} - Already exists (skipping)`);
      } else {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = await User.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          verified: true,
          location: userData.location,
          isAvailable: userData.isAvailable || false,
          rating: 0,
          ratingCount: 0,
          completedJobs: 0
        });
        console.log(`✅ ${userData.email} - Created (${userData.role})`);
      }
    }
    
    console.log('\n📊 Final user count:');
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    console.log('\n👥 All users:');
    const allUsers = await User.find({}).select('email role name isAvailable').sort('email');
    allUsers.forEach(u => {
      const available = u.role === 'provider' ? (u.isAvailable ? '🟢 Live' : '🔴 Offline') : '';
      console.log(`- ${u.email.padEnd(30)} | ${u.role?.padEnd(10)} | ${u.name} ${available}`);
    });
    
    console.log('\n🔑 Login Credentials:');
    console.log('─'.repeat(60));
    console.log('Admin:');
    console.log('  Email: admin@gmail.com | Password: admin123');
    console.log('\nProviders (1-4):');
    console.log('  Email: 1@gmail.com | Password: pass123');
    console.log('  Email: 2@gmail.com | Password: pass123');
    console.log('  Email: 3@gmail.com | Password: pass123');
    console.log('  Email: 4@gmail.com | Password: pass123');
    console.log('\nTest Accounts:');
    console.log('  Email: customer@test.com | Password: pass123');
    console.log('  Email: provider@test.com | Password: pass123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

restoreUsers();
