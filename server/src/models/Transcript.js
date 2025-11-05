import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema(
  {
    studentPrn: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    walletId: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
    },
    ipfsHash: {
      type: String,
      required: true,
      // Removed unique constraint - same file can be used for different students
      // Or we can make it unique per student (see composite index below)
      index: true,
    },
    ipfsUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: String,
    },
    createdByInstitution: {
      type: String,
      default: 'Institution',
    },
    // Blockchain fields
    transactionHash: {
      type: String,
      trim: true,
    },
    blockNumber: {
      type: Number,
    },
    blockchainRecorded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
transcriptSchema.index({ studentPrn: 1 });
transcriptSchema.index({ walletId: 1 });
transcriptSchema.index({ status: 1 });
transcriptSchema.index({ ipfsHash: 1 });
// Composite index: Prevent same file from being uploaded twice for same student
transcriptSchema.index({ ipfsHash: 1, studentPrn: 1 }, { unique: true });

const Transcript = mongoose.model('Transcript', transcriptSchema);

export default Transcript;

