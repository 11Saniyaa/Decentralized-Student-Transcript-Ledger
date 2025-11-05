import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    prn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true, // Index is already defined below, remove duplicate
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (prn already has unique index, so only add walletId)
studentSchema.index({ walletId: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;

