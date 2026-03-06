'use client';

import { useState } from 'react';

interface UseSignUpOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useSignUp(options: UseSignUpOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const sendOTP = async (email: string, name: string) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/send-registration-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to send verification code';
        setError(errorMessage);
        options.onError?.(errorMessage);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, otp: string) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || 'Registration failed';
        setError(errorMessage);
        options.onError?.(errorMessage);
        return false;
      }

      options.onSuccess?.();
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOTP,
    register,
    isLoading,
    error,
    setError,
  };
}
