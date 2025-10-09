// Check admin password hash
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

async function checkAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user with password: admin123');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await User.create({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        verified: true
      });
      
      console.log('✅ Admin user created!');
      console.log('Email:', newAdmin.email);
      console.log('Password: admin123');
    } else {
      console.log('✅ Admin user found!');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Has password:', !!admin.password);
      
      // Test password
      if (admin.password) {
        const isMatch = await bcrypt.compare('admin123', admin.password);
        console.log('\n🔐 Password "admin123" works:', isMatch ? '✅ YES' : '❌ NO');
        
        if (!isMatch) {
          console.log('\n⚠️  Password mismatch! Resetting to "admin123"...');
          admin.password = await bcrypt.hash('admin123', 10);
          await admin.save();
          console.log('✅ Password reset successfully!');
          console.log('You can now login with:');
          console.log('   Email: admin@gmail.com');
          console.log('   Password: admin123');
        }
      } else {
        console.log('\n⚠️  Admin has no password! Setting password to "admin123"...');
        admin.password = await bcrypt.hash('admin123', 10);
        await admin.save();
        console.log('✅ Password set successfully!');
      }
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdminPassword();
