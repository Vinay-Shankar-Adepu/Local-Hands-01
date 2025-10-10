/**
 * Migration Script: Fix Missing onboardingStatus for Existing Providers
 * 
 * This script updates existing providers who have:
 * - null or undefined onboardingStatus
 * - but have uploaded license information
 * 
 * Sets their status to 'pending' so admin can review and approve them.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '../../.env') });

const fixProviderStatuses = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all providers without onboardingStatus
    const providersWithoutStatus = await User.find({
      role: 'provider',
      $or: [
        { onboardingStatus: null },
        { onboardingStatus: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${providersWithoutStatus.length} providers without onboardingStatus`);

    if (providersWithoutStatus.length === 0) {
      console.log('✅ All providers have onboardingStatus set!');
      process.exit(0);
    }

    // Categorize providers
    const withLicense = [];
    const withoutLicense = [];

    for (const provider of providersWithoutStatus) {
      console.log(`\n👤 Provider: ${provider.name} (${provider.email})`);
      console.log(`   License Image: ${provider.licenseImage ? 'Yes' : 'No'}`);
      console.log(`   License Type: ${provider.licenseType || 'N/A'}`);
      
      if (provider.licenseImage) {
        withLicense.push(provider);
      } else {
        withoutLicense.push(provider);
      }
    }

    console.log(`\n📋 Summary:`);
    console.log(`   Providers with license: ${withLicense.length}`);
    console.log(`   Providers without license: ${withoutLicense.length}`);

    // Update providers with license to 'pending' (need admin review)
    if (withLicense.length > 0) {
      console.log(`\n🔄 Updating ${withLicense.length} providers with license to 'pending'...`);
      
      for (const provider of withLicense) {
        provider.onboardingStatus = 'pending';
        if (!provider.verificationSubmittedAt) {
          provider.verificationSubmittedAt = provider.createdAt || new Date();
        }
        await provider.save();
        console.log(`   ✓ ${provider.name} -> pending`);
      }
    }

    // Update providers without license to 'pending' with null values
    if (withoutLicense.length > 0) {
      console.log(`\n🔄 Updating ${withoutLicense.length} providers without license...`);
      
      for (const provider of withoutLicense) {
        provider.onboardingStatus = 'pending';
        // Clear these fields so they show as "not submitted" in UI
        provider.licenseImage = undefined;
        provider.licenseType = undefined;
        provider.licenseNumber = undefined;
        provider.verificationSubmittedAt = undefined;
        await provider.save();
        console.log(`   ✓ ${provider.name} -> pending (needs to upload license)`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Admins should review providers in the "Pending" tab');
    console.log('   2. Approve providers with valid licenses');
    console.log('   3. Providers without licenses need to upload them first');

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixProviderStatuses();
