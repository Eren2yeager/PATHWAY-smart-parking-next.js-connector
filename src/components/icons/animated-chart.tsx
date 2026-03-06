"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface AnimatedChartIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedChartIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const BAR_VARIANTS: Variants = {
  normal: { scaleY: 1, originY: 1 },
  animate: {
    scaleY: [1, 1.3, 1],
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

const AnimatedChartIcon = forwardRef<AnimatedChartIconHandle, AnimatedChartIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) controls.start("animate");
        onMouseEnter?.(e);
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) controls.start("normal");
        onMouseLeave?.(e);
      },
      [controls, onMouseLeave]
    );

    return (
      <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path animate={controls} d="M3 3v16a2 2 0 0 0 2 2h16" initial="normal" variants={BAR_VARIANTS} />
          <motion.path
            animate={controls}
            d="m19 9-5 5-4-4-3 3"
            initial="normal"
            variants={{ ...BAR_VARIANTS, animate: { ...BAR_VARIANTS.animate, transition: { duration: 0.6, delay: 0.1 } } }}
          />
          <motion.path
            animate={controls}
            d="M22 9h-6"
            initial="normal"
            variants={{ ...BAR_VARIANTS, animate: { ...BAR_VARIANTS.animate, transition: { duration: 0.6, delay: 0.15 } } }}
          />
        </svg>
      </div>
    );
  }
);

AnimatedChartIcon.displayName = "AnimatedChartIcon";
export { AnimatedChartIcon };
