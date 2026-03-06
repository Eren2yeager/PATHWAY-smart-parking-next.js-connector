import { NextResponse } from 'next/server';
import User from '@/models/User';
import RegistrationOTP from '@/models/RegistrationOTP';
import dbConnect from '@/lib/db/mongodb';
import nodemailer from 'nodemailer';

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter
function createTransporter() {
  const requiredEnvVars = [
    'EMAIL_SERVER_HOST',
    'EMAIL_SERVER_PORT', 
    'EMAIL_SERVER_USER',
    'EMAIL_SERVER_PASSWORD',
    'EMAIL_FROM'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

// Send OTP email for registration
async function sendRegistrationOTPEmail(email, otp, name) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Smart Parking - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0;">Smart Parking</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Parking Management System</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; text-align: center;">Welcome${name ? ', ' + name : ''}!</h2>
          
          <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
            Thank you for registering with Smart Parking. To complete your registration, please verify your email address using the code below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #1e40af; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #4b5563; margin: 20px 0 0 0; line-height: 1.6; font-size: 14px;">
            <strong>Important:</strong>
            <br>• This code will expire in 10 minutes
            <br>• If you didn't request this registration, please ignore this email
            <br>• Never share this code with anyone
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>This email was sent from Smart Parking Management System.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if user already exists (verified users only)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in temporary collection (will auto-delete after expiry)
    // Use upsert to update if email already has a pending OTP
    await RegistrationOTP.findOneAndUpdate(
      { email },
      {
        email,
        name: name || '',
        otp,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // Send OTP email
    try {
      await sendRegistrationOTPEmail(email, otp, name);
      
      return NextResponse.json(
        { message: 'Verification code sent successfully' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Remove OTP record if email failed
      await RegistrationOTP.deleteOne({ email });
      
      if (emailError.message.includes('Missing required environment variables')) {
        return NextResponse.json(
          { error: 'Email service not configured. Please contact support.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Send registration OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
