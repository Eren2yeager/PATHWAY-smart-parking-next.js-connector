'use client';

import { motion } from 'framer-motion';

interface AuthCardProps {
  title?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8"
    >
      <div className="space-y-4 sm:space-y-6">
        {title && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              {title}
            </h3>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}
