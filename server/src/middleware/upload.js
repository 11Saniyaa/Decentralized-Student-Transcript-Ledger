import multer from 'multer';

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  // Accept PDFs and also allow other file types for demo (can be restricted later)
  if (file.mimetype === 'application/pdf' || file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export default upload;

