// Script to fix duplicate null email issue
// This drops and recreates the email index with sparse option

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function fixEmailIndex() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get existing indexes
    console.log('\n📋 Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key), idx.sparse ? '(sparse)' : '');
    });

    // Drop the email_1 index if it exists and is not sparse
    const emailIndex = indexes.find(idx => idx.name === 'email_1');
    if (emailIndex) {
      console.log('\n🗑️  Dropping old email_1 index...');
      await usersCollection.dropIndex('email_1');
      console.log('✅ Old index dropped');
    }

    // Create new sparse unique index on email
    console.log('\n🔨 Creating new sparse unique index on email...');
    await usersCollection.createIndex(
      { email: 1 },
      { 
        unique: true, 
        sparse: true,  // This allows multiple null values
        name: 'email_1'
      }
    );
    console.log('✅ New sparse index created');

    // Verify
    console.log('\n✅ Final indexes:');
    const finalIndexes = await usersCollection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}:`, JSON.stringify(idx.key), idx.sparse ? '(sparse ✓)' : '');
    });

    console.log('\n✅ Email index fixed! Multiple users can now have null emails.');
    console.log('💡 This allows WhatsApp-only registration without email.\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixEmailIndex();
