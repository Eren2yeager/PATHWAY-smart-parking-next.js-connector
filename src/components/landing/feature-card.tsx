"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  className?: string;
  delay?: number;
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  iconBgColor = "bg-blue-500",
  className,
  delay = 0
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group",
        className
      )}
    >

      <motion.div
        className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", iconBgColor)}
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ duration: 0.6 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
        {title}
      </h3>
      <p className="text-white/80 text-sm group-hover:text-white/90 transition-colors">
        {description}
      </p>
    </motion.div>
  );
}
