"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface AnimatedAlertIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedAlertIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const TRIANGLE_VARIANTS: Variants = {
  normal: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.1, 1],
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.5 },
  },
};

const EXCLAMATION_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: {
    y: [0, -2, 0],
    transition: { duration: 0.5, delay: 0.1 },
  },
};

const AnimatedAlertIcon = forwardRef<AnimatedAlertIconHandle, AnimatedAlertIconProps>(
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
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          variants={TRIANGLE_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <motion.g animate={controls} initial="normal" variants={EXCLAMATION_VARIANTS}>
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </motion.g>
        </motion.svg>
      </div>
    );
  }
);

AnimatedAlertIcon.displayName = "AnimatedAlertIcon";
export { AnimatedAlertIcon };
