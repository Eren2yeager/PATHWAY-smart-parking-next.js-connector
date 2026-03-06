'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCarIcon } from '@/components/icons/animated-car';
import { useAuth } from '@/hooks/auth';
import { 
  ErrorAlert,
  LoadingSpinner,
  SuccessMessage 
} from '@/components/auth';
import { Button } from '@/components/shadcnComponents/button';
import { Input } from '@/components/shadcnComponents/input';
import { validatePassword } from '@/lib/utils/auth';

export default function SetupPasswordPage() {
  const { user, isAuthenticated, isLoading: sessionLoading } = useAuth();
  const { update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (sessionLoading || isRedirecting) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    // Redirect if password setup not needed
    if (user && !user.needsPasswordSetup) {
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, sessionLoading, router, isRedirecting]);

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
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

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to set password');
        setIsLoading(false);
        return;
      }

      setIsRedirecting(true);
      setSuccess(true);
      
      await update();
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);

    } catch (error) {
      console.error('Setup password error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsRedirecting(true);
    
    try {
      const response = await fetch('/api/auth/skip-password-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await update();
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        setIsRedirecting(false);
        setError('Failed to skip password setup. Please try again.');
      }
    } catch (error) {
      console.error('Skip password setup error:', error);
      setIsRedirecting(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (sessionLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (success) {
    return (
      <SuccessMessage
        title="Password Set Successfully!"
        message="Your password has been set. You can now sign in with either Google or your email and password."
      />
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
            <Lock className="h-12 w-12 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Set Up Your Password
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-base">
            Welcome, {user?.name}!
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Create a password to enable email/password sign-in alongside Google authentication
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
        >
          <div className="space-y-4 sm:space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    {error.includes('redirect') && (
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="mt-2 text-sm text-red-600 dark:text-red-300 underline hover:no-underline"
                      >
                        Click here to continue to dashboard
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSetupPassword} className="space-y-4">
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
                  autoFocus
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

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Why set a password?</strong>
                  <br />
                  Setting a password allows you to sign in with your email even when Google authentication is unavailable.
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Setting Password...' : 'Set Password'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="w-full"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center px-4"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            You can always set up a password later from your account settings
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Having trouble?{' '}
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-blue-600 dark:text-blue-400 underline hover:no-underline"
            >
              Continue to dashboard
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
