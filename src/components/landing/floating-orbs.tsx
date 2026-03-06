"use client";

import { motion } from "motion/react";

export function FloatingOrbs() {
  const orbs = [
    { size: 300, color: "rgba(59, 130, 246, 0.1)", duration: 20, delay: 0, x: "20%", y: "10%" },
    { size: 400, color: "rgba(147, 51, 234, 0.08)", duration: 25, delay: 2, x: "70%", y: "20%" },
    { size: 250, color: "rgba(34, 211, 238, 0.1)", duration: 18, delay: 4, x: "40%", y: "60%" },
    { size: 350, color: "rgba(168, 85, 247, 0.08)", duration: 22, delay: 1, x: "80%", y: "70%" },
  ];

  return (
    <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            background: orb.color,
            left: orb.x,
            top: orb.y,
          }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
