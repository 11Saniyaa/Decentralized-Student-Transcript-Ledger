// Script to fix duplicate index issue
// Run this once to update the database indexes

import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import Transcript from '../models/Transcript.js';

dotenv.config();

const fixIndexes = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Drop the old unique index on ipfsHash
    try {
      await Transcript.collection.dropIndex('ipfsHash_1');
      console.log('✅ Dropped old unique index on ipfsHash');
    } catch (error) {
      if (error.code === 27 || error.message.includes('index not found')) {
        console.log('ℹ️ Old index does not exist (already removed or never created)');
      } else {
        console.error('⚠️ Error dropping old index:', error.message);
      }
    }

    // Create new indexes (composite unique index)
    try {
      // Drop existing composite index if it exists
      try {
        await Transcript.collection.dropIndex('ipfsHash_1_studentPrn_1');
      } catch (e) {
        // Index doesn't exist, that's fine
      }

      // Create the new composite unique index
      await Transcript.collection.createIndex(
        { ipfsHash: 1, studentPrn: 1 },
        { unique: true, name: 'ipfsHash_1_studentPrn_1' }
      );
      console.log('✅ Created composite unique index on (ipfsHash, studentPrn)');
    } catch (error) {
      console.error('⚠️ Error creating composite index:', error.message);
    }

    // Create regular index on ipfsHash (non-unique)
    try {
      await Transcript.collection.createIndex({ ipfsHash: 1 }, { name: 'ipfsHash_1' });
      console.log('✅ Created regular index on ipfsHash');
    } catch (error) {
      if (error.code === 85 || error.message.includes('already exists')) {
        console.log('ℹ️ Index on ipfsHash already exists');
      } else {
        console.error('⚠️ Error creating index:', error.message);
      }
    }

    // List all indexes
    const indexes = await Transcript.collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(unique)' : ''}`);
    });

    console.log('\n✅ Index fix complete!');
    console.log('📝 Now you can upload the same file for different students,');
    console.log('   but the same file cannot be uploaded twice for the same student.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();

