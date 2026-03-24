"use client";

import { ArrowRight, LogOut } from "lucide-react";
import { AnimatedButton } from "@/components/landing/animated-button";
import { signOut } from "next-auth/react";

interface HeroButtonsProps {
  isAuthenticated: boolean;
  wantSignInButton: boolean;
}

export function HeroButtons({
  isAuthenticated,
  wantSignInButton,
}: HeroButtonsProps) {
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (isAuthenticated) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <AnimatedButton href="/dashboard" variant="primary">
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </AnimatedButton>

        {wantSignInButton && (
          <button
            onClick={handleSignOut}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-white/30  text-white shadow-lg hover:shadow-xl"
          >
            Sign Out
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <AnimatedButton href="/auth/signup" variant="primary">
        Get Started
      </AnimatedButton>
      {wantSignInButton && (
        <AnimatedButton href="/auth/signin" variant="secondary">
          Sign In
          <ArrowRight className="w-5 h-5" />
        </AnimatedButton>
      )}
    </div>
  );
}
