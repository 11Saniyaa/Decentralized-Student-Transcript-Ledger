import express from 'express';
import upload from '../middleware/upload.js';
import {
  uploadTranscript,
  getTranscriptById,
  getTranscriptsByStudent,
  getTranscriptsByWallet,
  getAllTranscripts,
  verifyTranscript,
} from '../controllers/transcriptController.js';

const router = express.Router();

// Upload route with error handling
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    next();
  });
}, uploadTranscript);
router.get('/all', getAllTranscripts);
router.get('/student/:prn', getTranscriptsByStudent);
router.get('/', getTranscriptsByWallet); // Query by ?walletId=
router.post('/:id/verify', verifyTranscript);
router.get('/:id', getTranscriptById);

export default router;

