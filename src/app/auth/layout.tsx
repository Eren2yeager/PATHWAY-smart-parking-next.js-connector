"use client";

import ThemeToggle from "@/components/theme/ThemeToggle";
import LightRays from "@/components/shadcnComponents/LightRays";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Light Rays Background Effect */}
      <div className="fixed bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 inset-0 z-0 opacity-20 dark:opacity-100 backdrop-blur-sm pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1}
          lightSpread={0.5}
          rayLength={3}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
          className="custom-rays"
          pulsating={false}
          fadeDistance={1}
          saturation={1}
        />
      </div>

      {/* Theme Toggle Button - Fixed Position for all auth pages */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
