'use client';

import { motion } from 'framer-motion';
import { AnimatedCarIcon } from '@/components/icons/animated-car';
import { useRouter } from 'next/navigation';
interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    const router = useRouter();


  return (
    <div className="min-h-screen  flex items-center justify-center py-2 px-2 sm:py-4 sm:px-4 lg:py-8 lg:px-8 overflow-y-auto">
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
            className="mx-auto h-20 w-20 flex items-center justify-center mb-6 hover:cursor-pointer"
            onClick={()=>{router.push('/');}}
          >
            <AnimatedCarIcon className="h-full w-full text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            {title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8 text-base">
            {subtitle}
          </p>
        </motion.div>

        {children}
      </div>
    </div>
  );
}
