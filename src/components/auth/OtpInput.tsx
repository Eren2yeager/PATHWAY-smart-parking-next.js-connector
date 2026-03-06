'use client';

import { useRef } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  length?: number;
}

export function OtpInput({ 
  value, 
  onChange, 
  disabled = false, 
  autoFocus = false,
  length = 6 
}: OtpInputProps) {
  const inputsRef = Array.from({ length }, () => useRef<HTMLInputElement>(null));

  const focusInput = (idx: number) => {
    if (inputsRef[idx] && inputsRef[idx].current) {
      inputsRef[idx].current?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      const newOtp = value.substring(0, idx) + '' + value.substring(idx + 1);
      onChange(newOtp);
      return;
    }
    const chars = val.split('');
    const newOtp = value.split('');
    for (let i = 0; i < chars.length && idx + i < length; i++) {
      newOtp[idx + i] = chars[i];
    }
    onChange(newOtp.join('').slice(0, length));
    if (idx + chars.length < length) {
      focusInput(idx + chars.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
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
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      focusInput(idx + 1);
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (paste) {
      onChange(paste.padEnd(length, ''));
      const lastIdx = Math.min(paste.length, length - 1);
      setTimeout(() => focusInput(lastIdx), 0);
    }
    e.preventDefault();
  };

  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length }).map((_, idx) => (
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
