import Transcript from '../models/Transcript.js';
import Student from '../models/Student.js';
import { recordTranscriptOnBlockchain } from '../config/blockchain.js';
import { uploadToPinata } from '../config/pinata.js';

// Upload transcript
export const uploadTranscript = async (req, res) => {
  try {
    console.log('Upload request received:', {
      body: req.body,
      file: req.file ? { name: req.file.originalname, size: req.file.size } : null,
    });

    const { prn, studentName, branch, walletId } = req.body;
    const file = req.file;

    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'PDF file is required. Please select a file to upload.',
      });
    }

    if (!prn || !studentName || !walletId) {
      console.error('Missing required fields:', { prn, studentName, walletId });
      return res.status(400).json({
        success: false,
        message: 'PRN, studentName, and walletId are required fields.',
      });
    }

    // Check if student exists
    let student = await Student.findOne({ prn: prn.toUpperCase() });
    if (!student) {
      console.warn(`Student not found: ${prn}`);
      // Auto-create student if not found (for demo convenience)
      try {
        student = new Student({
          name: studentName,
          prn: prn.toUpperCase(),
          walletId: walletId,
          branch: branch || 'Not Specified',
        });
        await student.save();
        console.log(`Auto-created student: ${prn}`);
      } catch (createError) {
        console.error('Failed to auto-create student:', createError);
        return res.status(404).json({
          success: false,
          message: 'Student not found. Please create the student first.',
          studentNotFound: true,
        });
      }
    }

    // Upload to Pinata
    let ipfsData;
    try {
      ipfsData = await uploadToPinata(file.buffer, file.originalname);
      console.log('✅ IPFS upload successful:', ipfsData.ipfsHash);
      
      if (ipfsData.isMock) {
        console.warn('⚠️ WARNING: Using mock IPFS hash. File was NOT uploaded to Pinata.');
        console.warn('⚠️ Configure Pinata API keys in .env for real IPFS storage.');
      }
    } catch (ipfsError) {
      console.error('❌ IPFS upload failed:', ipfsError.message);
      
      // Return error to user - don't silently fail
      return res.status(500).json({
        success: false,
        message: ipfsError.message || 'Failed to upload file to IPFS. Please check your Pinata configuration.',
        error: process.env.NODE_ENV === 'development' ? ipfsError.stack : undefined,
      });
    }

    // Check if transcript with same IPFS hash already exists
    const existingTranscript = await Transcript.findOne({ ipfsHash: ipfsData.ipfsHash });
    
    if (existingTranscript) {
      // Check if it's for the same student
      if (existingTranscript.studentPrn === prn.toUpperCase()) {
        console.warn(`⚠️ Transcript with same IPFS hash already exists for student ${prn}`);
        return res.status(409).json({
          success: false,
          message: 'This file has already been uploaded for this student. The transcript already exists in the system.',
          data: existingTranscript,
          duplicate: true,
        });
      } else {
        // Same file but different student - this is valid, but we need to handle unique constraint
        // Create a new record with a modified hash (add timestamp suffix) or update existing
        console.log(`📄 Same file being used for different student. Creating new transcript record.`);
      }
    }

    // Create transcript record
    try {
      const transcript = new Transcript({
        studentPrn: prn.toUpperCase(),
        studentName,
        walletId,
        branch: branch || student.branch || 'Not Specified',
        filename: file.originalname,
        ipfsHash: ipfsData.ipfsHash,
        ipfsUrl: ipfsData.ipfsUrl,
        status: 'Pending',
        uploadedAt: new Date(),
      });

      await transcript.save();
      console.log('✅ Transcript saved successfully:', transcript._id);

      // Record on blockchain (optional, non-blocking)
      if (process.env.CONTRACT_ADDRESS) {
        try {
          console.log('📝 Attempting to record transcript on blockchain...');
          const blockchainResult = await recordTranscriptOnBlockchain(
            walletId,
            ipfsData.ipfsHash,
            prn.toUpperCase(),
            branch || student.branch || 'Not Specified'
          );

          if (blockchainResult.success) {
            // Update transcript with blockchain info
            transcript.transactionHash = blockchainResult.transactionHash;
            transcript.blockNumber = blockchainResult.blockNumber;
            transcript.blockchainRecorded = true;
            await transcript.save();
            console.log('✅ Transcript recorded on blockchain:', blockchainResult.transactionHash);
          } else {
            console.warn('⚠️ Blockchain recording failed (continuing anyway):', blockchainResult.message);
          }
        } catch (blockchainError) {
          console.error('❌ Blockchain recording error (continuing anyway):', blockchainError.message);
          // Don't fail the upload if blockchain fails
        }
      } else {
        console.log('ℹ️ Blockchain not configured - skipping on-chain recording');
      }

      res.status(201).json({
        success: true,
        data: transcript,
        message: 'Transcript uploaded successfully!',
        blockchainRecorded: transcript.blockchainRecorded || false,
        transactionHash: transcript.transactionHash || null,
      });
    } catch (saveError) {
      // Handle duplicate key error specifically
      if (saveError.code === 11000) {
        console.warn('⚠️ Duplicate IPFS hash detected:', saveError.keyValue);
        
        // Try to find the existing transcript
        const existing = await Transcript.findOne({ ipfsHash: ipfsData.ipfsHash });
        
        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'This file has already been uploaded. The transcript already exists in the system.',
            data: existing,
            duplicate: true,
          });
        }
        
        return res.status(409).json({
          success: false,
          message: 'A transcript with this IPFS hash already exists. Please upload a different file.',
          duplicate: true,
        });
      }
      
      // Re-throw other errors
      throw saveError;
    }
  } catch (error) {
    console.error('Upload transcript error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This file has already been uploaded to the system. Please upload a different file.',
        duplicate: true,
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload transcript. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Get transcript by ID
export const getTranscriptById = async (req, res) => {
  try {
    const { id } = req.params;

    const transcript = await Transcript.findById(id);
    
    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found',
      });
    }

    res.json({
      success: true,
      data: transcript,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get transcripts by student PRN
export const getTranscriptsByStudent = async (req, res) => {
  try {
    const { prn } = req.params;

    const transcripts = await Transcript.find({ studentPrn: prn.toUpperCase() })
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      count: transcripts.length,
      data: transcripts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get transcripts by wallet ID
export const getTranscriptsByWallet = async (req, res) => {
  try {
    const { walletId } = req.query;

    if (!walletId) {
      return res.status(400).json({
        success: false,
        message: 'walletId query parameter is required',
      });
    }

    const transcripts = await Transcript.find({ walletId })
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      count: transcripts.length,
      data: transcripts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all transcripts
export const getAllTranscripts = async (req, res) => {
  try {
    const transcripts = await Transcript.find()
      .sort({ uploadedAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: transcripts.length,
      data: transcripts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify transcript
export const verifyTranscript = async (req, res) => {
  try {
    const { id } = req.params;
    const { verifier } = req.body;

    const transcript = await Transcript.findById(id);
    
    if (!transcript) {
      return res.status(404).json({
        success: false,
        message: 'Transcript not found',
      });
    }

    if (transcript.status === 'Verified') {
      return res.status(400).json({
        success: false,
        message: 'Transcript is already verified',
      });
    }

    transcript.status = 'Verified';
    transcript.verifiedAt = new Date();
    transcript.verifiedBy = verifier || 'Institution';

    await transcript.save();

    // TODO: Optional blockchain integration here
    // if (process.env.CONTRACT_ADDRESS) {
    //   await recordOnBlockchain(transcript.ipfsHash, transcript.studentPrn, transcript.walletId);
    // }

    res.json({
      success: true,
      data: transcript,
      message: 'Transcript verified successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

