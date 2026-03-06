'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import { useAuth, useSignIn, useSignUp } from '@/hooks/auth';
import { 
  AuthLayout, 
  AuthCard, 
  ErrorAlert, 
  GoogleButton,
  OtpInput,
  Divider,
  LoadingSpinner,
  SuccessMessage 
} from '@/components/auth';
import { Button } from '@/components/shadcnComponents/button';
import { Input } from '@/components/shadcnComponents/input';
import { validateEmail, validatePassword } from '@/lib/utils/auth';

/**
 * Main sign-up page component
 */
export default function SignUpPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignUpPageContent />
    </Suspense>
  );
}

/**
 * Sign-up page content component
 * Handles user registration and redirects
 */
function SignUpPageContent() {
  const { isAuthenticated, isLoading: sessionLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState('');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const { signInWithGoogle, isLoading: signInLoading, error: signInError } = useSignIn({
    callbackUrl,
  });

  const { sendOTP, register, isLoading: signUpLoading, error: signUpError, setError } = useSignUp({
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => router.push('/auth/signin'), 2000);
    }
  });

  const isLoading = signInLoading || signUpLoading;
  const error = signInError || signUpError;

  useEffect(() => {
    if (sessionLoading) return;
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, sessionLoading, callbackUrl, router]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email || !name) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const success = await sendOTP(email, name);
    if (success) {
      setShowOTPForm(true);
      setShowEmailForm(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || 'Invalid password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    await register(email, password, name, otp);
  };

  const handleResendOTP = async () => {
    const success = await sendOTP(email, name);
    if (success) {
      setOtp('');
    }
  };

  const handleBackToEmailForm = () => {
    setShowOTPForm(false);
    setShowEmailForm(true);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleCancelEmailForm = () => {
    setShowEmailForm(false);
    setEmail('');
    setName('');
    setError('');
  };

  if (sessionLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return null;
  }

  if (isSuccess) {
    return (
      <SuccessMessage
        title="Account Created Successfully!"
        message="Welcome to Smart Parking! Your account has been created and verified. You'll be redirected to sign in shortly."
      />
    );
  }

  if (showOTPForm) {
    return (
      <AuthLayout
        title="Verify Your Email"
        subtitle={`We've sent a 6-digit code to ${email}`}
      >
        <AuthCard>
          <ErrorAlert message={error} />

          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                autoFocus={true}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min. 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToEmailForm}
              >
                Back
              </Button>
            </div>
          </form>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join Smart Parking"
      subtitle="Create your account to access the parking management system"
    >
      <AuthCard title="Create your account">
        <ErrorAlert message={error} />

        {showEmailForm ? (
          <form onSubmit={handleSendOTP} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Sending Code...' : 'Send Verification Code'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEmailForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="text-center space-y-3">
              <Button
                onClick={() => setShowEmailForm(true)}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-5 w-5" />
                Sign up with Email
              </Button>
            </div>

            <Divider />

            <GoogleButton 
              onClick={signInWithGoogle} 
              disabled={isLoading}
              text="Continue with Google"
            />
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </AuthCard>

      <div className="text-center px-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Already have an account?{' '}
          <button 
            onClick={() => router.push('/auth/signin')}
            className="text-blue-700 dark:text-blue-400 font-medium hover:text-blue-600 underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
