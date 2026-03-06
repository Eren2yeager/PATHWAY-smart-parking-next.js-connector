import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  googleId?: string;
  password?: string;
  image?: string;
  createdAt: Date;
  lastLogin: Date;
  resetPasswordOTP?: string;
  resetPasswordExpiry?: Date;
  isVerified?: boolean;
  needsPasswordSetup?: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'operator', 'viewer'],
      default: 'viewer',
      required: true,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: true, // Default true for Google OAuth users
    },
    needsPasswordSetup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
