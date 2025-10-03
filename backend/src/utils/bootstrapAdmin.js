import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  let admin = await User.findOne({ email });
  if (!admin) {
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const hash = await bcrypt.hash(password, 10);
    admin = await User.create({ name: 'Admin', email, password: hash, role: 'admin', verified: true });
    console.log(`👑 Admin user created: ${email} / (provided password)`);
  } else if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
    console.log('👑 Existing user elevated to admin:', email);
  } else {
    console.log('👑 Admin user present');
  }
}