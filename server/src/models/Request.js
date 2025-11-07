import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    studentPrn: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    message: {
      type: String,
      trim: true,
    },
    requestType: {
      type: String,
      default: 'Transcript Request',
    },
    requestedFor: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processed', 'Rejected'],
      default: 'Pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
requestSchema.index({ studentPrn: 1 });
requestSchema.index({ status: 1 });

const Request = mongoose.model('Request', requestSchema);

export default Request;


