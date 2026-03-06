import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db/mongodb';
import nodemailer from 'nodemailer';

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create email transporter
function createTransporter() {
  // Check if required environment variables are set
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

  // The error in your screenshot is because nodemailer does NOT have a method called `createTransporter`.
  // The correct method is `createTransport`.
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Smart Parking - Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; margin: 0;">Guidora</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0;">Parking Management System</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin: 0 0 20px 0; text-align: center;">Password Reset Request</h2>
          
          <p style="color: #4b5563; margin: 0 0 20px 0; line-height: 1.6;">
            You requested to reset your password for your Smart Parking account. Use the code below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #1e40af; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #4b5563; margin: 20px 0 0 0; line-height: 1.6; font-size: 14px;">
            <strong>Important:</strong>
            <br>• This code will expire in 10 minutes
            <br>• If you didn't request this reset, please ignore this email
            <br>• Never share this code with anyone
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>This email was sent from Smart Parking. If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with this email exists, a reset code has been sent.' },
        { status: 200 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store OTP in user document
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          resetPasswordOTP: otp,
          resetPasswordExpiry: otpExpiry,
        },
      }
    );

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      
      return NextResponse.json(
        { message: 'Reset code sent successfully' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Remove OTP from database if email failed
      await User.findOneAndUpdate(
        { email },
        {
          $unset: {
            resetPasswordOTP: 1,
            resetPasswordExpiry: 1,
          },
        }
      );
      
      // Check if it's a configuration error
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
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
