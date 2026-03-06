import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRegistrationOTP extends Document {
  email: string;
  name: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const RegistrationOTPSchema = new Schema<IRegistrationOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired documents
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
RegistrationOTPSchema.index({ email: 1 });
RegistrationOTPSchema.index({ expiresAt: 1 });

const RegistrationOTP: Model<IRegistrationOTP> = 
  mongoose.models.RegistrationOTP || 
  mongoose.model<IRegistrationOTP>('RegistrationOTP', RegistrationOTPSchema);

export default RegistrationOTP;
