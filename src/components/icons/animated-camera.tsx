"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface AnimatedCameraIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AnimatedCameraIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const CAMERA_VARIANTS: Variants = {
  normal: { scale: 1 },
  animate: {
    scale: [1, 0.9, 1],
    transition: { duration: 0.4 },
  },
};

const LENS_VARIANTS: Variants = {
  normal: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: { duration: 0.4, delay: 0.1 },
  },
};

const AnimatedCameraIcon = forwardRef<AnimatedCameraIconHandle, AnimatedCameraIconProps>(
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
          variants={CAMERA_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <motion.circle animate={controls} cx="12" cy="13" r="3" variants={LENS_VARIANTS} />
        </motion.svg>
      </div>
    );
  }
);

AnimatedCameraIcon.displayName = "AnimatedCameraIcon";
export { AnimatedCameraIcon };
