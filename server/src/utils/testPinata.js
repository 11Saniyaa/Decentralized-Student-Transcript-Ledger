// Test script to verify Pinata credentials
import dotenv from 'dotenv';
import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import path from 'path';

dotenv.config();

const testPinata = async () => {
  const apiKey = process.env.PINATA_API_KEY?.trim();
  const secretKey = process.env.PINATA_SECRET_API_KEY?.trim();

  console.log('Testing Pinata Configuration...\n');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ NOT FOUND');
  console.log('Secret Key:', secretKey ? `${secretKey.substring(0, 10)}...` : '❌ NOT FOUND');
  console.log('');

  if (!apiKey || !secretKey) {
    console.error('❌ Pinata credentials not found in .env file');
    return;
  }

  try {
    const pinata = new pinataSDK(apiKey, secretKey);
    
    // Test authentication by calling testAuthentication
    console.log('Testing Pinata authentication...');
    const authTest = await pinata.testAuthentication();
    
    if (authTest.authenticated) {
      console.log('✅ Pinata authentication successful!');
      console.log('   User:', authTest.info?.username || 'N/A');
    } else {
      console.log('❌ Pinata authentication failed');
    }
  } catch (error) {
    console.error('❌ Pinata test error:', error.message);
    console.error('   Full error:', error);
    
    if (error.message.includes('credentials')) {
      console.error('\n💡 Solution:');
      console.error('   1. Verify your PINATA_API_KEY and PINATA_SECRET_API_KEY in .env');
      console.error('   2. Make sure there are no extra spaces or quotes');
      console.error('   3. Get new keys from https://pinata.cloud if needed');
    }
  }
};

testPinata();

