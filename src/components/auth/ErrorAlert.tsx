'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3"
    >
      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
      <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
    </motion.div>
  );
}
