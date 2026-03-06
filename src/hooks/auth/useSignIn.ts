'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface UseSignInOptions {
  callbackUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useSignIn(options: UseSignInOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError('');

      await signIn('google', {
        callbackUrl: options.callbackUrl || '/',
      });
    } catch (error) {
      console.error('Google sign in error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      options.onError?.(errorMessage);
      setIsLoading(false);
    }
  };

  const signInWithCredentials = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError('');

      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: options.callbackUrl || '/',
        redirect: false,
      });

      if (result?.error) {
        console.error('SignIn error:', result.error);
        const errorMessage = `Authentication failed: ${result.error}`;
        setError(errorMessage);
        options.onError?.(errorMessage);
      } else if (result?.ok) {
        options.onSuccess?.();
        window.location.href = options.callbackUrl || '/';
      } else {
        const errorMessage = 'Sign in failed. Please try again.';
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    signInWithCredentials,
    isLoading,
    error,
    setError,
  };
}
