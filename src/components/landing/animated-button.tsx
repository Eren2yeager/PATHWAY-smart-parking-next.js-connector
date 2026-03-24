"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface AnimatedButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export function AnimatedButton({ href, children, variant = "primary", className }: AnimatedButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-xl transition-all relative overflow-hidden group";
  
  const variantStyles = {
    primary: "bg-white text-blue-600 shadow-lg hover:shadow-2xl",
    secondary: "bg-blue-500/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-blue-500/30",
    ghost: "bg-transparent text-white border-2 border-white/20 hover:border-white/40 hover:bg-white/5"
  };

  return (
    <Link href={href} className={cn(baseStyles, variantStyles[variant], className)}>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </Link>
  );
}
