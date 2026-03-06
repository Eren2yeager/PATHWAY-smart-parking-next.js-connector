import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    // Validate input
    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpiry: { $gt: new Date() }, // OTP not expired
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP fields
    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
      },
      $unset: {
        resetPasswordOTP: 1,
        resetPasswordExpiry: 1,
      },
    });

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
