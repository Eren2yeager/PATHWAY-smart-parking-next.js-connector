'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail } from 'lucide-react';
import { useAuth, useSignIn } from '@/hooks/auth';
import { 
  AuthLayout, 
  AuthCard, 
  ErrorAlert, 
  GoogleButton,
  Divider,
  LoadingSpinner 
} from '@/components/auth';
import { Button } from '@/components/shadcnComponents/button';
import { Input } from '@/components/shadcnComponents/input';

/**
 * Main sign-in page component
 */
export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignInPageContent />
    </Suspense>
  );
}

/**
 * Sign-in page content component
 * Handles authentication flow and redirects
 */
function SignInPageContent() {
  const { isAuthenticated, isLoading: sessionLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const { signInWithGoogle, signInWithCredentials, isLoading, error, setError } = useSignIn({
    callbackUrl,
  });

  useEffect(() => {
    if (sessionLoading) return;
    if (isAuthenticated) {
      router.push(callbackUrl);
    }
  }, [isAuthenticated, sessionLoading, callbackUrl, router]);

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    await signInWithCredentials(email, password);
  };

  const handleCancelEmailForm = () => {
    setShowEmailForm(false);
    setEmail('');
    setPassword('');
    setError('');
  };

  if (sessionLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      title="Welcome to Smart Parking"
      subtitle="Sign in to access your parking management dashboard"
    >
      <AuthCard title="Sign in to continue">
        <ErrorAlert message={error} />

        {showEmailForm ? (
          <form onSubmit={handleEmailPasswordSignIn} className="space-y-3 sm:space-y-4">
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
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEmailForm}
              >
                Cancel
              </Button>
            </div>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => router.push('/auth/forgot-password')}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm underline block w-full"
              >
                Forgot your password?
              </button>
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
                Sign in with Email
              </Button>
            </div>

            <Divider />

            <GoogleButton onClick={signInWithGoogle} disabled={isLoading} />
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            By signing in, you agree to our{' '}
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
          New to Smart Parking?{' '}
          <button 
            onClick={() => router.push('/auth/signup')}
            className="text-blue-700 dark:text-blue-400 font-medium hover:text-blue-600 underline"
          >
            Create an account
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
