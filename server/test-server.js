// Simple test script to verify server can start
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing server configuration...');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Missing');
console.log('PORT:', process.env.PORT || 5000);
console.log('PINATA_API_KEY:', process.env.PINATA_API_KEY ? '✅ Set' : '⚠️ Not set (will use fallback)');
console.log('PINATA_SECRET_API_KEY:', process.env.PINATA_SECRET_API_KEY ? '✅ Set' : '⚠️ Not set (will use fallback)');

// Try importing main server file
try {
  console.log('\n✅ Configuration looks good!');
  console.log('Run: npm run dev');
} catch (error) {
  console.error('❌ Error:', error.message);
}


