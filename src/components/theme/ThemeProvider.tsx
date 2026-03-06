"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { theme } from "@/lib/utils/theme";
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: "light" | "dark";
  enableSystem?: boolean;
  storageKey?: string;
}

export default function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = true,
  storageKey = "smart-parking-theme",
}: ThemeProviderProps) {
  // Map your centralized theme colors to next-themes
  const themeColors = {
    light: {
      background: theme.modes.light.background.default,
      foreground: theme.modes.light.text.primary,
      card: theme.modes.light.background.paper,
      cardForeground: theme.modes.light.text.primary,
      popover: theme.modes.light.background.default,
      popoverForeground: theme.modes.light.text.primary,
      primary: theme.colors.primary[600],
      primaryForeground: theme.colors.primary[50],
      secondary: theme.colors.neutral[100],
      secondaryForeground: theme.colors.neutral[800],
      muted: theme.colors.neutral[100],
      mutedForeground: theme.colors.neutral[500],
      accent: theme.colors.neutral[100],
      accentForeground: theme.colors.neutral[800],
      destructive: theme.colors.error[600],
      destructiveForeground: theme.colors.error[50],
      success: theme.colors.success[600],
      successForeground: theme.colors.success[50],
      warning: theme.colors.warning[600],
      warningForeground: theme.colors.warning[50],
      border: theme.colors.border.light,
      input: theme.colors.border.light,
      ring: theme.modes.light.ring.color,
    },
    dark: {
      background: theme.modes.dark.background.default,
      foreground: theme.modes.dark.text.primary,
      card: theme.modes.dark.background.paper,
      cardForeground: theme.modes.dark.text.primary,
      popover: theme.modes.dark.background.default,
      popoverForeground: theme.modes.dark.text.primary,
      primary: theme.colors.primary[400],
      primaryForeground: theme.colors.primary[900],
      secondary: theme.colors.neutral[800],
      secondaryForeground: theme.colors.neutral[100],
      muted: theme.colors.neutral[800],
      mutedForeground: theme.colors.neutral[400],
      accent: theme.colors.neutral[800],
      accentForeground: theme.colors.neutral[100],
      destructive: theme.colors.error[500],
      destructiveForeground: theme.colors.error[50],
      success: theme.colors.success[500],
      successForeground: theme.colors.success[50],
      warning: theme.colors.warning[500],
      warningForeground: theme.colors.warning[50],
      border: theme.colors.border.dark,
      input: theme.colors.border.dark,
      ring: theme.modes.dark.ring.color,
    },
  };

  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      storageKey={storageKey}
      themes={Object.keys(themeColors) as Array<keyof typeof themeColors>}
      forcedTheme={undefined}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
