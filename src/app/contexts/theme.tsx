"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Available DaisyUI themes with metadata
export const AVAILABLE_THEMES = {
  // Popular light themes (shown first)
  light: { isDark: false, isPopular: true },
  cupcake: { isDark: false, isPopular: true }, 
  emerald: { isDark: false, isPopular: true },
  corporate: { isDark: false, isPopular: true },
  
  // Other light themes  
  bumblebee: { isDark: false, isPopular: false },
  retro: { isDark: false, isPopular: false },
  cyberpunk: { isDark: false, isPopular: false },
  valentine: { isDark: false, isPopular: false },
  garden: { isDark: false, isPopular: false },
  lofi: { isDark: false, isPopular: false },
  pastel: { isDark: false, isPopular: false },
  fantasy: { isDark: false, isPopular: false },
  wireframe: { isDark: false, isPopular: false },
  cmyk: { isDark: false, isPopular: false },
  autumn: { isDark: false, isPopular: false },
  acid: { isDark: false, isPopular: false },
  lemonade: { isDark: false, isPopular: false },
  winter: { isDark: false, isPopular: false },
  nord: { isDark: false, isPopular: false },
  
  // Popular dark themes (shown first)
  dark: { isDark: true, isPopular: true },
  business: { isDark: true, isPopular: true },
  dracula: { isDark: true, isPopular: true },
  synthwave: { isDark: true, isPopular: true },
  
  // Other dark themes
  halloween: { isDark: true, isPopular: false },
  forest: { isDark: true, isPopular: false },
  aqua: { isDark: true, isPopular: false },
  black: { isDark: true, isPopular: false },
  luxury: { isDark: true, isPopular: false },
  night: { isDark: true, isPopular: false },
  coffee: { isDark: true, isPopular: false },
  dim: { isDark: true, isPopular: false },
  sunset: { isDark: true, isPopular: false }
} as const;

export type Theme = keyof typeof AVAILABLE_THEMES;

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: readonly Theme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const DEFAULT_THEME: Theme = "business";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("app-theme") as Theme;
      if (savedTheme && savedTheme in AVAILABLE_THEMES) {
        setThemeState(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        document.documentElement.setAttribute("data-theme", DEFAULT_THEME);
      }
      setIsInitialized(true);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("app-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  };

  // Render loading skeleton during theme initialization to prevent hydration mismatch
  if (!isInitialized) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        themes: Object.keys(AVAILABLE_THEMES) as readonly Theme[]
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};