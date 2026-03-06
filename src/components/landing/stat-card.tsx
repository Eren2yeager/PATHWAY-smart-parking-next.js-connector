"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  iconColor?: string;
  delay?: number;
}

export function StatCard({ icon, title, subtitle, iconColor = "text-blue-600", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      className="text-center group cursor-pointer"
    >
      <motion.div
        className="flex items-center justify-center mb-2"
        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5 }}
      >
        <div className={cn("transition-colors", iconColor)}>
          {icon}
        </div>
      </motion.div>
      <motion.div
        className="text-3xl font-bold text-white mb-1 group-hover:text-blue-600 transition-colors"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {title}
      </motion.div>
      <div className="text-white/50 group-hover:text-white/80 transition-colors">{subtitle}</div>
    </motion.div>
  );
}
