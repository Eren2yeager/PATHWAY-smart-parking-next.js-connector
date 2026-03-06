"use client";

import { motion } from "motion/react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface FeatureSectionProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  features: string[];
  bgGradient?: string;
  iconBgColor?: string;
  delay?: number;
}

export function FeatureSection({
  icon,
  title,
  subtitle,
  features,
  iconBgColor = "bg-blue-600",
  delay = 0
}: FeatureSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
      className={cn("bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group")}
    >
      <div className="flex items-center gap-4 mb-6">
        <motion.div
          className={cn("w-16 h-16 rounded-xl flex items-center justify-center", iconBgColor)}
          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {icon}
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="text-white/50">{subtitle}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: delay + 0.1 * index }}
            className="flex items-start gap-3 group"
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 360 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0 group-hover:text-green-500 transition-colors" />
            </motion.div>
            <span className="text-white/50 group-hover:text-white/80 transition-colors">{feature}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
