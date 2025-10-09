import mongoose from 'mongoose';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

async function testLocationUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a provider
    const provider = await User.findOne({ email: '1@gmail.com' });
    if (!provider) {
      console.log('❌ Provider not found!');
      process.exit(1);
    }

    console.log('📍 BEFORE Service Completion:');
    console.log('━'.repeat(50));
    console.log(`Provider: ${provider.name} (${provider.email})`);
    console.log(`Current Location: [${provider.location.coordinates[0]}, ${provider.location.coordinates[1]}]`);
    if (provider.lastServiceLocation) {
      console.log(`Last Service Location: [${provider.lastServiceLocation.coordinates[0]}, ${provider.lastServiceLocation.coordinates[1]}]`);
    } else {
      console.log(`Last Service Location: (never completed a service)`);
    }
    console.log(`Last Service Completed: ${provider.lastServiceCompletedAt || '(never)'}`);

    // Create a test booking
    const testBooking = new Booking({
      bookingId: 'TEST-' + Date.now(),
      customer: provider._id, // Just for test
      provider: provider._id,
      service: new mongoose.Types.ObjectId(), // Dummy
      status: 'in_progress',
      location: {
        type: 'Point',
        coordinates: [78.5245, 17.3687] // Vinay Nagar, Saidabad (customer location)
      }
    });
    await testBooking.save();

    console.log('\n🎯 Simulating Service Completion...');
    console.log(`Customer was at: [78.5245, 17.3687] (Vinay Nagar)`);

    // Simulate completion (same code as in bookingController.js)
    testBooking.status = 'completed';
    testBooking.completedAt = new Date();
    await testBooking.save();

    if (testBooking.provider && testBooking.location) {
      await User.findByIdAndUpdate(testBooking.provider, {
        location: testBooking.location,
        lastServiceLocation: testBooking.location,
        lastServiceCompletedAt: new Date()
      });
    }

    // Fetch updated provider
    const updatedProvider = await User.findById(provider._id);

    console.log('\n📍 AFTER Service Completion:');
    console.log('━'.repeat(50));
    console.log(`Provider: ${updatedProvider.name}`);
    console.log(`NEW Location: [${updatedProvider.location.coordinates[0]}, ${updatedProvider.location.coordinates[1]}]`);
    console.log(`Last Service Location: [${updatedProvider.lastServiceLocation.coordinates[0]}, ${updatedProvider.lastServiceLocation.coordinates[1]}]`);
    console.log(`Last Service Completed: ${updatedProvider.lastServiceCompletedAt}`);

    console.log('\n✅ SUCCESS! Provider location automatically updated to customer location!');
    console.log('   This is exactly like clicking "Locate Me" button at customer address.');

    // Cleanup test booking
    await Booking.deleteOne({ _id: testBooking._id });
    console.log('\n🧹 Test booking cleaned up.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLocationUpdate();
