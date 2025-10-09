import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Hyderabad landmark coordinates (various areas)
const hyderabadLocations = [
  { name: 'HITEC City', coordinates: [78.3809, 17.4435] },
  { name: 'Banjara Hills', coordinates: [78.4382, 17.4239] },
  { name: 'Jubilee Hills', coordinates: [78.4089, 17.4239] },
  { name: 'Gachibowli', coordinates: [78.3489, 17.4399] },
  { name: 'Kondapur', coordinates: [78.3649, 17.4647] },
  { name: 'Madhapur', coordinates: [78.3912, 17.4483] },
  { name: 'Kukatpally', coordinates: [78.4089, 17.4948] },
  { name: 'Miyapur', coordinates: [78.3598, 17.4948] },
  { name: 'Ameerpet', coordinates: [78.4482, 17.4374] },
  { name: 'SR Nagar', coordinates: [78.4483, 17.4410] },
  { name: 'Begumpet', coordinates: [78.4683, 17.4399] },
  { name: 'Somajiguda', coordinates: [78.4583, 17.4281] },
  { name: 'Nampally', coordinates: [78.4692, 17.3850] },
  { name: 'Abids', coordinates: [78.4744, 17.3850] },
  { name: 'Secunderabad', coordinates: [78.5007, 17.4399] },
  { name: 'Begum Bazaar', coordinates: [78.4767, 17.3964] },
  { name: 'LB Nagar', coordinates: [78.5526, 17.3420] },
  { name: 'Dilsukhnagar', coordinates: [78.5245, 17.3687] },
  { name: 'Malakpet', coordinates: [78.5026, 17.3754] },
  { name: 'Charminar', coordinates: [78.4747, 17.3616] },
  { name: 'Moazzam Jahi Market', coordinates: [78.4767, 17.3850] },
  { name: 'Mehdipatnam', coordinates: [78.4384, 17.3964] },
  { name: 'Tolichowki', coordinates: [78.4009, 17.3964] },
  { name: 'Manikonda', coordinates: [78.3850, 17.4026] },
  { name: 'Financial District', coordinates: [78.3392, 17.4183] },
  { name: 'Kokapet', coordinates: [78.3426, 17.4050] },
  { name: 'Narsingi', coordinates: [78.3426, 17.3850] },
  { name: 'Rajendra Nagar', coordinates: [78.3926, 17.3750] },
  { name: 'Attapur', coordinates: [78.4209, 17.3687] },
  { name: 'Shamshabad', coordinates: [78.4026, 17.2437] },
];

const serviceTypes = [
  'Plumbing',
  'Electrical',
  'AC Repair',
  'Carpentry',
  'House Cleaning',
  'Painting',
  'Appliance Repair',
  'Electronics Repair',
  'CCTV Installation',
  'Pest Control'
];

const firstNames = ['Rajesh', 'Suresh', 'Ramesh', 'Venkat', 'Krishna', 'Sai', 'Ravi', 'Anil', 'Kiran', 'Mohan', 'Prasad', 'Kumar', 'Srikanth', 'Mahesh', 'Naveen', 'Chandu', 'Vikram', 'Rohan', 'Arjun', 'Pradeep'];
const lastNames = ['Kumar', 'Reddy', 'Rao', 'Prasad', 'Sharma', 'Gupta', 'Varma', 'Naidu', 'Chowdary', 'Goud'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomRating() {
  // Generate ratings between 3.0 and 5.0 with more weight on higher ratings
  const rand = Math.random();
  if (rand < 0.3) return parseFloat((Math.random() * 0.5 + 4.5).toFixed(1)); // 30% chance 4.5-5.0
  if (rand < 0.6) return parseFloat((Math.random() * 0.5 + 4.0).toFixed(1)); // 30% chance 4.0-4.5
  if (rand < 0.85) return parseFloat((Math.random() * 0.5 + 3.5).toFixed(1)); // 25% chance 3.5-4.0
  return parseFloat((Math.random() * 0.5 + 3.0).toFixed(1)); // 15% chance 3.0-3.5
}

function getRandomRatingCount() {
  return Math.floor(Math.random() * 150) + 10; // Between 10 and 160 ratings
}

function getRandomCompletedJobs() {
  return Math.floor(Math.random() * 200) + 20; // Between 20 and 220 jobs
}

function getRandomPhone() {
  return `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

async function seedHyderabadProviders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing test providers (email pattern: provider*.hyd@test.com)
    await User.deleteMany({ email: /provider.*\.hyd@test\.com/ });
    console.log('🗑️  Cleared existing Hyderabad test providers');

    const hashedPassword = await bcrypt.hash('pass123', 10);
    const providers = [];

    // Create 30 providers
    for (let i = 1; i <= 30; i++) {
      const location = getRandomElement(hyderabadLocations);
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const serviceType = getRandomElement(serviceTypes);
      
      const provider = {
        name: `${firstName} ${lastName}`,
        email: `provider${i}.hyd@test.com`,
        password: hashedPassword,
        phone: getRandomPhone(),
        role: 'provider',
        verified: true,
        isAvailable: Math.random() > 0.3, // 70% are available, 30% offline
        location: {
          type: 'Point',
          coordinates: location.coordinates
        },
        rating: getRandomRating(),
        ratingCount: getRandomRatingCount(),
        completedJobs: getRandomCompletedJobs(),
        otpVerified: true,
        onboardingStatus: 'approved',
        // Add some metadata for testing
        address: `${location.name}, Hyderabad, Telangana`,
        documents: ['aadhar.jpg', 'pan.jpg'],
        selfie: 'selfie.jpg'
      };

      providers.push(provider);
    }

    // Insert all providers
    const created = await User.insertMany(providers);
    console.log(`\n✅ Created ${created.length} Hyderabad providers\n`);

    // Display summary
    console.log('📊 Summary by Area:');
    const byArea = {};
    created.forEach(p => {
      const loc = hyderabadLocations.find(l => 
        l.coordinates[0] === p.location.coordinates[0] && 
        l.coordinates[1] === p.location.coordinates[1]
      );
      const area = loc ? loc.name : 'Unknown';
      byArea[area] = (byArea[area] || 0) + 1;
    });
    Object.entries(byArea).forEach(([area, count]) => {
      console.log(`   ${area}: ${count} provider(s)`);
    });

    console.log('\n📊 Rating Distribution:');
    const ratings = {
      '5.0': 0,
      '4.5-4.9': 0,
      '4.0-4.4': 0,
      '3.5-3.9': 0,
      '3.0-3.4': 0
    };
    created.forEach(p => {
      if (p.rating >= 5.0) ratings['5.0']++;
      else if (p.rating >= 4.5) ratings['4.5-4.9']++;
      else if (p.rating >= 4.0) ratings['4.0-4.4']++;
      else if (p.rating >= 3.5) ratings['3.5-3.9']++;
      else ratings['3.0-3.4']++;
    });
    Object.entries(ratings).forEach(([range, count]) => {
      console.log(`   ${range}★: ${count} providers`);
    });

    console.log('\n📊 Availability:');
    const available = created.filter(p => p.isAvailable).length;
    const offline = created.length - available;
    console.log(`   🟢 Available: ${available} providers`);
    console.log(`   🔴 Offline: ${offline} providers`);

    console.log('\n📋 Sample Providers:');
    created.slice(0, 5).forEach(p => {
      const loc = hyderabadLocations.find(l => 
        l.coordinates[0] === p.location.coordinates[0] && 
        l.coordinates[1] === p.location.coordinates[1]
      );
      console.log(`   ${p.name} - ${p.email}`);
      console.log(`      📍 ${loc?.name || 'Unknown'} (${p.location.coordinates[1]}, ${p.location.coordinates[0]})`);
      console.log(`      ⭐ ${p.rating} (${p.ratingCount} ratings) | 🎯 ${p.completedJobs} jobs`);
      console.log(`      ${p.isAvailable ? '🟢 Available' : '🔴 Offline'}`);
    });

    console.log('\n✅ All providers created successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('   Email: provider1.hyd@test.com to provider30.hyd@test.com');
    console.log('   Password: pass123');
    console.log('\n🧪 Test Customer Location (Gachibowli): [78.3489, 17.4399]');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedHyderabadProviders();
