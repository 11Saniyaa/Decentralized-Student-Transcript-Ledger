import pinataSDK from '@pinata/sdk';

let pinata = null;

// Initialize Pinata with proper credential checking
export const initializePinata = () => {
  // Remove quotes if present (dotenv sometimes includes them)
  let apiKey = process.env.PINATA_API_KEY?.trim() || '';
  let secretKey = process.env.PINATA_SECRET_API_KEY?.trim() || '';
  
  // Remove surrounding quotes if they exist
  if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
    apiKey = apiKey.slice(1, -1);
  }
  if (secretKey.startsWith('"') && secretKey.endsWith('"')) {
    secretKey = secretKey.slice(1, -1);
  }
  
  if (!apiKey || !secretKey) {
    console.warn('⚠️ Pinata credentials not found in .env file');
    console.warn('⚠️ PINATA_API_KEY and PINATA_SECRET_API_KEY are required');
    console.warn('⚠️ Current values:', { 
      apiKey: apiKey ? `${apiKey.substring(0, 5)}...` : 'empty',
      secretKey: secretKey ? `${secretKey.substring(0, 5)}...` : 'empty'
    });
    return null;
  }

  if (apiKey === 'your_pinata_api_key_here' || secretKey === 'your_pinata_secret_api_key_here') {
    console.warn('⚠️ Pinata credentials not configured (using placeholder values)');
    return null;
  }

  // Validate key formats
  if (apiKey.length < 10 || secretKey.length < 10) {
    console.warn('⚠️ Pinata credentials appear to be invalid (too short)');
    return null;
  }

  try {
    // Pinata SDK is a class, must use 'new'
    pinata = new pinataSDK(apiKey, secretKey);
    
    // Test the connection by calling a simple method
    console.log('✅ Pinata SDK initialized successfully');
    console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
    return pinata;
  } catch (error) {
    console.error('❌ Pinata initialization error:', error.message);
    return null;
  }
};

// Don't initialize on module load - wait for dotenv to load first
// Initialize lazily when needed

export const uploadToPinata = async (fileBuffer, filename) => {
  // Initialize Pinata if not already done (lazy initialization after dotenv loads)
  if (!pinata) {
    pinata = initializePinata();
  }
  
  // Get credentials fresh from environment
  let apiKey = process.env.PINATA_API_KEY?.trim() || '';
  let secretKey = process.env.PINATA_SECRET_API_KEY?.trim() || '';
  
  // Remove surrounding quotes if they exist
  if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
    apiKey = apiKey.slice(1, -1);
  }
  if (secretKey.startsWith('"') && secretKey.endsWith('"')) {
    secretKey = secretKey.slice(1, -1);
  }
  
  // Check if credentials are valid
  if (!apiKey || !secretKey || 
      apiKey === 'your_pinata_api_key_here' || 
      secretKey === 'your_pinata_secret_api_key_here' ||
      apiKey.length < 10 || secretKey.length < 10) {
    console.warn('⚠️ Pinata not properly configured. Using fallback mode with mock IPFS hash.');
    console.warn('⚠️ Files will NOT be uploaded to IPFS. Configure Pinata credentials for real IPFS storage.');
    const mockHash = `QmMock${Date.now()}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    return {
      ipfsHash: mockHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${mockHash}`,
      ipfsGatewayUrl: `https://ipfs.io/ipfs/${mockHash}`,
      isMock: true,
    };
  }

  // Create a new Pinata instance for each upload to ensure fresh credentials
  let pinataInstance;
  try {
    pinataInstance = new pinataSDK(apiKey, secretKey);
  } catch (initError) {
    console.error('❌ Failed to initialize Pinata SDK:', initError.message);
    throw new Error(`Failed to initialize Pinata: ${initError.message}`);
  }

  try {
    console.log(`📤 Uploading file to Pinata: ${filename} (${(fileBuffer.length / 1024).toFixed(2)} KB)`);
    
    const options = {
      pinataMetadata: {
        name: filename,
        keyvalues: {
          type: 'student-transcript',
          timestamp: Date.now().toString(),
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    // Create a readable stream from buffer
    const { Readable } = await import('stream');
    const stream = Readable.from(fileBuffer);

    // Upload to Pinata
    console.log('   Calling pinata.pinFileToIPFS...');
    const result = await pinataInstance.pinFileToIPFS(stream, options);
    
    if (!result || !result.IpfsHash) {
      throw new Error('Invalid response from Pinata - no IPFS hash returned');
    }
    
    console.log(`✅ File uploaded to Pinata successfully!`);
    console.log(`   IPFS Hash: ${result.IpfsHash}`);
    console.log(`   Gateway URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log(`   IPFS.io URL: https://ipfs.io/ipfs/${result.IpfsHash}`);
    
    return {
      ipfsHash: result.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      ipfsGatewayUrl: `https://ipfs.io/ipfs/${result.IpfsHash}`,
      isMock: false,
    };
  } catch (error) {
    console.error('❌ Pinata upload error:', error.message);
    console.error('   Full error:', error);
    
    // Check if it's a credentials error
    if (error.message.includes('credentials') || error.message.includes('No credentials')) {
      throw new Error(`Pinata credentials error: ${error.message}. Please verify your PINATA_API_KEY and PINATA_SECRET_API_KEY in .env file are correct.`);
    }
    
    // Don't use fallback - throw error so user knows upload failed
    throw new Error(`Failed to upload to Pinata: ${error.message}. Please check your Pinata API credentials and network connection.`);
  }
};

export default pinata;
