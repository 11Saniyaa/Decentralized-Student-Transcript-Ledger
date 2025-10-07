#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🎉 Pinata Setup for Student Transcript Ledger\n');

console.log('📋 Follow these steps:');
console.log('1. Go to https://pinata.cloud');
console.log('2. Create a free account');
console.log('3. Go to API Keys section');
console.log('4. Create new API key with permissions: PinFileToIPFS, PinJSONToIPFS, PinByHash, Unpin');
console.log('5. Copy your API Key and Secret Key\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setup() {
  try {
    const apiKey = await askQuestion('Enter your Pinata API Key: ');
    const secretKey = await askQuestion('Enter your Pinata Secret Key: ');
    
    if (!apiKey || !secretKey) {
      console.log('❌ Both API Key and Secret Key are required');
      rl.close();
      return;
    }
    
    const envContent = `# Pinata IPFS Configuration
VITE_PINATA_API_KEY=${apiKey}
VITE_PINATA_SECRET_KEY=${secretKey}

# Optional: Web3.Storage alternative
# VITE_WEB3_STORAGE_TOKEN=your_token_here
`;
    
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ .env file created successfully!');
    console.log('🔄 Please restart your development server: npm run dev');
    console.log('🧪 Test by uploading a document in the Create Transcript page');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup();
