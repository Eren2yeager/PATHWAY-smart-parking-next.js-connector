'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/auth';
import { 
  AuthLayout, 
  AuthCard, 
  ErrorAlert,
  LoadingSpinner 
} from '@/components/auth';
import { Button } from '@/components/shadcnComponents/button';
import { Input } from '@/components/shadcnComponents/input';
import { validateEmail } from '@/lib/utils/auth';

/**
 * Forgot password page component
 */
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}

/**
 * Forgot password page content component
 */
function ForgotPasswordPageContent() {
  const { isAuthenticated, isLoading: sessionLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, sessionLoading, router]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset code');
        return;
      }

      setIsEmailSent(true);
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return null;
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-2 px-2 sm:py-4 sm:px-4 lg:py-8 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Check Your Email
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We've sent a 6-digit reset code to <strong>{email}</strong>. 
              Please check your email and enter the code to reset your password.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)}
                className="w-full"
              >
                Enter Reset Code
              </Button>
              
              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail('');
                }}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm underline"
              >
                Try a different email
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="No worries! Enter your email address and we'll send you a reset code."
    >
      <AuthCard title="Enter your email address">
        <ErrorAlert message={error} />

        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm underline flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </button>
        </div>
      </AuthCard>

      <div className="text-center px-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Remember your password?{' '}
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
