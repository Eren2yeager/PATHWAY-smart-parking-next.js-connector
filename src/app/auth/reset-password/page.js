'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { AnimatedCarIcon } from '@/components/icons/animated-car';
import { Button } from '@/components/shadcnComponents/button';
import { Input } from '@/components/shadcnComponents/input';

/**
 * Reset password page component
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

/**
 * OTP Input component with 6 boxes
 */
function OtpInput({ value, onChange, disabled = false, autoFocus = false }) {
  const inputsRef = Array.from({ length: 6 }, () => useRef(null));

  const focusInput = (idx) => {
    if (inputsRef[idx] && inputsRef[idx].current) {
      inputsRef[idx].current.focus();
    }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      const newOtp = value.substring(0, idx) + '' + value.substring(idx + 1);
      onChange(newOtp);
      return;
    }
    let chars = val.split('');
    let newOtp = value.split('');
    for (let i = 0; i < chars.length && idx + i < 6; i++) {
      newOtp[idx + i] = chars[i];
    }
    onChange(newOtp.join('').slice(0, 6));
    if (idx + chars.length < 6) {
      focusInput(idx + chars.length);
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (value[idx]) {
        const newOtp = value.substring(0, idx) + '' + value.substring(idx + 1);
        onChange(newOtp);
      } else if (idx > 0) {
        focusInput(idx - 1);
        const newOtp = value.substring(0, idx - 1) + '' + value.substring(idx);
        onChange(newOtp);
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      focusInput(idx - 1);
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      focusInput(idx + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste) {
      onChange(paste.padEnd(6, ''));
      const lastIdx = Math.min(paste.length, 5);
      setTimeout(() => focusInput(lastIdx), 0);
    }
    e.preventDefault();
  };

  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={inputsRef[idx]}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoFocus={autoFocus && idx === 0}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white font-mono tracking-widest"
          value={value[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

/**
 * Reset password page content component
 */
function ResetPasswordPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.push('/');
    }

    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push('/auth/forgot-password');
    }
  }, [session, status, router, searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setIsSuccess(true);

      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
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
        setError(data.error || 'Failed to resend code');
        return;
      }

      setOtp('');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 lg:h-32 lg:w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  if (isSuccess) {
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
              Password Reset Successfully!
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your password has been updated successfully. You'll be redirected to the sign-in page shortly.
            </p>

            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-2 px-2 sm:py-4 sm:px-4 lg:py-8 lg:px-8 overflow-y-auto">
      <div className="max-w-md w-full space-y-4 sm:space-y-6 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-full flex items-center justify-center mb-6 shadow-lg"
          >
            <AnimatedCarIcon className="h-12 w-12 text-white" />
          </motion.div>

          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Reset Password
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8 text-base">
            Enter the 6-digit code sent to <strong>{email}</strong> and your new password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
        >
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Enter reset code and new password
              </h3>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3"
              >
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reset Code (6 digits)
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
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => router.push('/auth/forgot-password')}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm underline flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Forgot Password
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center px-4"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Remember your password?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-blue-700 dark:text-blue-400 font-medium hover:text-blue-600 underline"
            >
              Sign in here
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
