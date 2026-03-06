"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcnComponents/tooltip";
export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          {isDark ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-orange-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600  dark:text-gray-300" />
          )}
        </TooltipTrigger>
        <TooltipContent >
          {isDark ? 
          <p>Switch to light</p>
           : 
          <p>Switch to Dark</p>
        }
        </TooltipContent>
      </Tooltip>
    </button>
  );
}
