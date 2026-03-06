import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import RegistrationOTP from '@/models/RegistrationOTP';
import dbConnect from '@/lib/db/mongodb';

export async function POST(request) {
  try {
    const { email, password, name, otp } = await request.json();

    // Validate input
    if (!email || !password || !otp) {
      return NextResponse.json(
        { error: 'Email, password, and verification code are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the OTP record from temporary collection
    const otpRecord = await RegistrationOTP.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() }, // OTP not expired
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if user already exists (shouldn't happen, but double-check)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Clean up OTP record
      await RegistrationOTP.deleteOne({ email });
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user (only after OTP verification)
    const newUser = await User.create({
      email,
      name: name || otpRecord.name,
      password: hashedPassword,
      isVerified: true,
      lastLogin: new Date(),
    });

    // Delete OTP record after successful registration
    await RegistrationOTP.deleteOne({ email });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
