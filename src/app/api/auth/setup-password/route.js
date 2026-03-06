import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';

export async function POST(request) {
  try {
    // Get the current session
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { password, confirmPassword } = await request.json();

    // Validate input
    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirmation are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find user
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a password
    if (user.password && !user.needsPasswordSetup) {
      return NextResponse.json(
        { error: 'Password already set' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with password
    user.password = hashedPassword;
    user.needsPasswordSetup = false;
    await user.save();

    return NextResponse.json(
      { 
        message: 'Password set successfully',
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Setup password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
