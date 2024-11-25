import mongoose, { Schema, Document } from 'mongoose';

export interface INFT extends Document {
  tokenId: number;
  senderAddress: string;
  recipientAddress: string;
  contractAddress: string;
  claimMethod: 'EMAIL' | 'CRYPTO';  // Using literal type for better type safety
  email?: string;                   // Optional in the interface
  claimAuthToken: string;
  isClaimed: boolean;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NFTSchema = new Schema({
  tokenId: {
    type: Number,
    required: true,
    index: true
  },
  contractAddress: {
    type: String,
    required: true,
    trim: true
  },
  senderAddress: {
    type: String,
    required: true,
    trim: true
  },
  recipientAddress: {
    type: String,
    required: false,
    trim: true
  },
  claimMethod: {
    type: String,
    required: true,
    enum: ['EMAIL', 'CRYPTO'],
    default: 'CRYPTO'
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  claimAuthToken: {
    type: String,
    required: true,
    unique: true
  },
  isClaimed: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: false
  }
}, {
  timestamps: true,
  versionKey: false
});

// Pre-save middleware to validate email requirement
NFTSchema.pre('save', function(next) {
  if (this.claimMethod === 'EMAIL' && !this.email) {
    next(new Error('Email is required when claim method is EMAIL'));
  }
  next();
});

// Indexes for better query performance
NFTSchema.index({ senderAddress: 1 });
NFTSchema.index({ recipientAddress: 1 });
NFTSchema.index({ claimAuthToken: 1 });
NFTSchema.index({ email: 1 });

export default mongoose.model<INFT>('NFT', NFTSchema);