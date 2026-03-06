import { NextResponse } from 'next/server';
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

    // Set needsPasswordSetup to false (user chose to skip)
    user.needsPasswordSetup = false;
    await user.save();

    return NextResponse.json(
      { 
        message: 'Password setup skipped',
        success: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Skip password setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
