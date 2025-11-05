import { ethers } from 'ethers';

// Simple blockchain service for recording transcript transactions
// Works with local Hardhat network or any EVM-compatible chain

let provider = null;
let wallet = null;
let contract = null;

// Contract ABI (simplified for transcript creation)
const CONTRACT_ABI = [
  "function createTranscript(address _studentAddress, string memory _degree, string memory _major, string memory _semester, string memory _ipfsHash) external returns (uint256)",
  "event TranscriptCreated(uint256 indexed transcriptId, address indexed studentAddress, uint256 indexed institutionId)"
];

const initializeBlockchain = () => {
  const providerUrl = process.env.ETH_PROVIDER_URL || 'http://127.0.0.1:8545';
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const privateKey = process.env.CONTRACT_PRIVATE_KEY;

  // Only initialize if contract address is provided
  if (!contractAddress) {
    console.warn('⚠️ Blockchain not configured - CONTRACT_ADDRESS not set in .env');
    console.warn('⚠️ Transcripts will be saved to database only (no blockchain recording)');
    return null;
  }

  try {
    // Initialize provider
    provider = new ethers.JsonRpcProvider(providerUrl);
    
    // Initialize wallet if private key provided
    if (privateKey) {
      wallet = new ethers.Wallet(privateKey, provider);
      contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);
      console.log('✅ Blockchain initialized');
      console.log(`   Provider: ${providerUrl}`);
      console.log(`   Contract: ${contractAddress}`);
      console.log(`   Wallet: ${wallet.address}`);
      return { provider, wallet, contract };
    } else {
      // Read-only mode
      contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);
      console.log('⚠️ Blockchain initialized (read-only mode)');
      console.warn('⚠️ CONTRACT_PRIVATE_KEY not set - cannot write transactions');
      return { provider, contract };
    }
  } catch (error) {
    console.error('❌ Blockchain initialization error:', error.message);
    return null;
  }
};

// Record transcript creation on blockchain
export const recordTranscriptOnBlockchain = async (studentAddress, ipfsHash, prn, branch = '') => {
  // Check if blockchain is configured
  if (!contract || !process.env.CONTRACT_ADDRESS) {
    console.log('ℹ️ Blockchain not configured - skipping on-chain recording');
    return { success: false, message: 'Blockchain not configured' };
  }

  // Check if wallet is available for transactions
  if (!wallet) {
    console.log('ℹ️ No wallet configured - skipping on-chain recording');
    return { success: false, message: 'Wallet not configured' };
  }

  try {
    console.log('📝 Recording transcript on blockchain...');
    console.log(`   Student: ${studentAddress}`);
    console.log(`   IPFS Hash: ${ipfsHash}`);
    console.log(`   PRN: ${prn}`);

    // Convert wallet address if needed
    let studentAddr = studentAddress;
    if (!studentAddr.startsWith('0x') || studentAddr.length !== 42) {
      // If not a valid address, use zero address (will fail in contract but we handle it)
      studentAddr = '0x0000000000000000000000000000000000000000';
      console.warn('⚠️ Invalid student address, using zero address');
    }

    // Call smart contract
    const tx = await contract.createTranscript(
      studentAddr,
      'Bachelor of Engineering', // degree
      branch || 'Computer Science', // major
      'Sem 8', // semester
      ipfsHash // IPFS hash
    );

    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
    console.log(`   Transaction Hash: ${receipt.hash}`);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error('❌ Blockchain transaction failed:', error.message);
    
    // Don't fail the entire upload if blockchain fails
    return {
      success: false,
      message: error.message,
      error: error.reason || error.message,
    };
  }
};

// Initialize on module load
const blockchain = initializeBlockchain();

export default blockchain;

