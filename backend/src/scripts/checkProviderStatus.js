/**
 * Check Provider Verification Status
 * 
 * This script checks the verification status of all providers
 * and shows which ones need attention.
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

const checkProviders = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all providers
    const allProviders = await User.find({ role: 'provider' })
      .select('name email phone onboardingStatus licenseImage licenseType licenseNumber verificationSubmittedAt createdAt')
      .sort('name');

    console.log(`📊 Total Providers: ${allProviders.length}\n`);

    // Categorize
    const approved = allProviders.filter(p => p.onboardingStatus === 'approved');
    const pending = allProviders.filter(p => p.onboardingStatus === 'pending');
    const rejected = allProviders.filter(p => p.onboardingStatus === 'rejected');
    const noStatus = allProviders.filter(p => !p.onboardingStatus);

    console.log('📈 Status Breakdown:');
    console.log(`   ✅ Approved: ${approved.length}`);
    console.log(`   ⏳ Pending: ${pending.length}`);
    console.log(`   ❌ Rejected: ${rejected.length}`);
    console.log(`   ⚠️  No Status: ${noStatus.length}\n`);

    if (noStatus.length > 0) {
      console.log('⚠️  PROVIDERS WITHOUT STATUS:\n');
      noStatus.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name || 'Unnamed'}`);
        console.log(`   Email: ${p.email || 'N/A'}`);
        console.log(`   Phone: ${p.phone || 'N/A'}`);
        console.log(`   License Image: ${p.licenseImage ? '✓ Yes' : '✗ No'}`);
        console.log(`   License Type: ${p.licenseType || 'N/A'}`);
        console.log(`   License Number: ${p.licenseNumber || 'N/A'}`);
        console.log(`   Created: ${p.createdAt ? p.createdAt.toLocaleDateString() : 'N/A'}`);
        console.log('');
      });

      console.log('\n💡 RECOMMENDED ACTIONS:\n');
      
      const withLicense = noStatus.filter(p => p.licenseImage);
      const withoutLicense = noStatus.filter(p => !p.licenseImage);

      if (withLicense.length > 0) {
        console.log(`📋 ${withLicense.length} provider(s) have uploaded licenses but need status:`);
        console.log('   → Run migration script to set them to "pending" for admin review\n');
      }

      if (withoutLicense.length > 0) {
        console.log(`📋 ${withoutLicense.length} provider(s) haven't uploaded licenses:`);
        console.log('   → They need to upload license documents first\n');
      }

      console.log('🔧 To fix this, run:');
      console.log('   node backend/src/scripts/fixProviderOnboardingStatus.js\n');
    } else {
      console.log('✅ All providers have a status assigned!\n');
    }

    // Show pending that need review
    if (pending.length > 0) {
      console.log('⏳ PENDING REVIEW:\n');
      pending.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name || 'Unnamed'}`);
        console.log(`   Email: ${p.email}`);
        console.log(`   License: ${p.licenseType?.replace('_', ' ') || 'N/A'}`);
        console.log(`   Submitted: ${p.verificationSubmittedAt?.toLocaleDateString() || 'N/A'}`);
        console.log('');
      });
      console.log('👉 Admin should review these in /admin/verifications\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProviders();
