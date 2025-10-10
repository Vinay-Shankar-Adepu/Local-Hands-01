/**
 * Detailed Provider Check
 * Shows all fields for a specific provider or all providers
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const checkDetailedProviders = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not found in .env file');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get email from command line argument or check all
    const emailFilter = process.argv[2];

    const query = { role: 'provider' };
    if (emailFilter) {
      query.email = new RegExp(emailFilter, 'i');
    }

    const providers = await User.find(query)
      .select('name email phone onboardingStatus licenseImage licenseType licenseNumber verificationSubmittedAt verificationReviewedAt verificationReviewedBy rejectionReason createdAt')
      .sort('name');

    console.log(`📊 Found ${providers.length} provider(s)\n`);

    providers.forEach((p, i) => {
      console.log(`${'='.repeat(60)}`);
      console.log(`Provider #${i + 1}: ${p.name || 'Unnamed'}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`Email:                  ${p.email || 'N/A'}`);
      console.log(`Phone:                  ${p.phone || 'N/A'}`);
      console.log(`Onboarding Status:      ${p.onboardingStatus || '❌ NULL/UNDEFINED'}`);
      console.log(`License Image URL:      ${p.licenseImage || '❌ NULL'}`);
      console.log(`License Type:           ${p.licenseType || '❌ NULL'}`);
      console.log(`License Number:         ${p.licenseNumber || 'N/A'}`);
      console.log(`Verification Submitted: ${p.verificationSubmittedAt ? p.verificationSubmittedAt.toLocaleString() : 'N/A'}`);
      console.log(`Verification Reviewed:  ${p.verificationReviewedAt ? p.verificationReviewedAt.toLocaleString() : 'N/A'}`);
      console.log(`Reviewed By (ID):       ${p.verificationReviewedBy || 'N/A'}`);
      console.log(`Rejection Reason:       ${p.rejectionReason || 'N/A'}`);
      console.log(`Account Created:        ${p.createdAt ? p.createdAt.toLocaleString() : 'N/A'}`);
      console.log('');

      // Diagnosis
      if (!p.onboardingStatus) {
        console.log('⚠️  ISSUE: onboardingStatus is NULL - needs to be set');
      }
      if (!p.licenseImage && !p.licenseType) {
        console.log('📝 NOTE: No license uploaded yet');
      }
      if (p.licenseImage && !p.licenseType) {
        console.log('⚠️  ISSUE: Has license image but no licenseType - data inconsistency');
      }
      console.log('');
    });

    console.log(`\n✅ Check complete`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

console.log('Usage: node checkDetailedProviders.js [email]');
console.log('Example: node checkDetailedProviders.js x@gmail.com\n');

checkDetailedProviders();
