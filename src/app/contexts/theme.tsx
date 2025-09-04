"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth";
import { 
  getPlayerTheme, 
  setPlayerTheme, 
  getPlayerLightTheme,
  setPlayerLightTheme,
  getPlayerDarkTheme,
  setPlayerDarkTheme,
  getPlayerThemeMode,
  setPlayerThemeMode,
  migrateAnonymousThemeToDualSystem
} from "@/lib/firebase/player";
import { 
  DEFAULT_LIGHT_THEME, 
  DEFAULT_DARK_THEME,
  isThemeDark,
  getThemeModeFromTheme
} from "@/app/constants/themes";

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

export type ThemeSource = 'system' | 'anonymous' | 'user' | 'default';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: readonly Theme[];
  getSystemTheme: () => Theme;
  getSystemPrefersDark: () => boolean;
  themeLoading: boolean;
  themeSource: ThemeSource;
  lightTheme: Theme;
  darkTheme: Theme;
  themeMode: 'system' | 'light' | 'dark';
  setLightTheme: (theme: Theme) => void;
  setDarkTheme: (theme: Theme) => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  setAnonymousThemeMode: (mode: 'system' | 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const DEFAULT_THEME: Theme = "business";

// Function to detect system theme preference
const getSystemTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }
  return DEFAULT_THEME;
};

// Function to safely detect if system prefers dark theme
const getSystemPrefersDark = (): boolean => {
  if (typeof window !== "undefined" && window.matchMedia) {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  }
  return false;
};

// Function to get anonymous theme preference (separate from authenticated user themes)
const getAnonymousThemePreference = (): Theme | null => {
  if (typeof window !== "undefined") {
    const savedAnonymousTheme = localStorage.getItem("anonymous-theme") as Theme;
    if (savedAnonymousTheme && savedAnonymousTheme in AVAILABLE_THEMES) {
      return savedAnonymousTheme;
    }
  }
  return null;
};

// Function to get anonymous theme mode preference
const getAnonymousThemeModePreference = (): 'system' | 'light' | 'dark' | null => {
  if (typeof window !== "undefined") {
    const savedAnonymousThemeMode = localStorage.getItem("anonymous-theme-mode") as 'system' | 'light' | 'dark';
    if (savedAnonymousThemeMode && ['system', 'light', 'dark'].includes(savedAnonymousThemeMode)) {
      return savedAnonymousThemeMode;
    }
  }
  return null;
};

// Function to resolve theme based on dual theme system
const resolveThemeFromMode = (
  themeMode: 'system' | 'light' | 'dark', 
  lightTheme: Theme, 
  darkTheme: Theme, 
  systemTheme: Theme
): Theme => {
  switch (themeMode) {
    case 'light':
      return lightTheme;
    case 'dark':
      return darkTheme;
    case 'system':
    default:
      // For system mode, use lightTheme or darkTheme based on system preference
      return isThemeDark(systemTheme) ? darkTheme : lightTheme;
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { player, loading: authLoading } = useAuth();
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [themeLoading, setThemeLoading] = useState(true);
  const [themeSource, setThemeSource] = useState<ThemeSource>('default');
  const [lightTheme, setLightThemeState] = useState<Theme>(DEFAULT_LIGHT_THEME);
  const [darkTheme, setDarkThemeState] = useState<Theme>(DEFAULT_DARK_THEME);
  const [themeMode, setThemeModeState] = useState<'system' | 'light' | 'dark'>('system');

  // Initialize dual theme system based on current auth state
  useEffect(() => {
    const initializeDualTheme = async () => {
      if (authLoading) return; // Wait for auth to initialize

      setThemeLoading(true);

      try {
        let currentLightTheme: Theme = DEFAULT_LIGHT_THEME;
        let currentDarkTheme: Theme = DEFAULT_DARK_THEME;
        let currentThemeMode: 'system' | 'light' | 'dark' = 'system';
        let source: ThemeSource = 'default';

        if (player && !player.isAnonymous) {
          // Authenticated user - check Firebase dual theme preferences
          try {
            const [playerLightTheme, playerDarkTheme, playerThemeMode] = await Promise.all([
              getPlayerLightTheme(player.uid),
              getPlayerDarkTheme(player.uid),
              getPlayerThemeMode(player.uid)
            ]);

            if (playerLightTheme || playerDarkTheme || playerThemeMode) {
              // User has dual theme preferences
              currentLightTheme = playerLightTheme || DEFAULT_LIGHT_THEME;
              currentDarkTheme = playerDarkTheme || DEFAULT_DARK_THEME;
              currentThemeMode = playerThemeMode || 'system';
              source = 'user';
            } else {
              // Check for legacy single theme or anonymous theme to migrate
              const playerTheme = await getPlayerTheme(player.uid);
              const anonymousTheme = getAnonymousThemePreference();
              const anonymousThemeMode = getAnonymousThemeModePreference();

              if (anonymousTheme || anonymousThemeMode) {
                // Migrate anonymous dual theme preferences
                try {
                  await migrateAnonymousThemeToDualSystem(player.uid, anonymousTheme || getSystemTheme(), anonymousThemeMode);
                  // Reload the preferences after migration
                  const [newLightTheme, newDarkTheme, newThemeMode] = await Promise.all([
                    getPlayerLightTheme(player.uid),
                    getPlayerDarkTheme(player.uid),
                    getPlayerThemeMode(player.uid)
                  ]);
                  currentLightTheme = newLightTheme || DEFAULT_LIGHT_THEME;
                  currentDarkTheme = newDarkTheme || DEFAULT_DARK_THEME;
                  currentThemeMode = newThemeMode || 'system';
                  source = 'user';
                } catch (migrationError) {
                  console.warn('Failed to migrate anonymous dual theme:', migrationError);
                  // Use anonymous preferences temporarily
                  currentThemeMode = anonymousThemeMode || (anonymousTheme ? getThemeModeFromTheme(anonymousTheme) : 'system');
                  source = 'anonymous';
                }
              } else if (playerTheme && playerTheme in AVAILABLE_THEMES) {
                // Migrate legacy single theme to dual theme system
                try {
                  const isDark = AVAILABLE_THEMES[playerTheme].isDark;
                  currentThemeMode = isDark ? 'dark' : 'light';
                  if (isDark) {
                    currentDarkTheme = playerTheme;
                  } else {
                    currentLightTheme = playerTheme;
                  }
                  
                  // Save dual theme preferences
                  await Promise.all([
                    setPlayerLightTheme(player.uid, currentLightTheme),
                    setPlayerDarkTheme(player.uid, currentDarkTheme),
                    setPlayerThemeMode(player.uid, currentThemeMode)
                  ]);
                  source = 'user';
                } catch (error) {
                  console.warn('Failed to migrate legacy theme:', error);
                  currentThemeMode = AVAILABLE_THEMES[playerTheme].isDark ? 'dark' : 'light';
                  source = 'user';
                }
              } else {
                // No preferences, use system defaults
                currentThemeMode = 'system';
                source = 'system';
              }
            }

            // Clear anonymous theme preferences when authenticated and using user preferences
            if (source === 'user') {
              localStorage.removeItem("anonymous-theme");
              localStorage.removeItem("anonymous-theme-mode");
            }
          } catch (error) {
            console.error('Error loading user dual theme:', error);
            // Fall back to system defaults
            currentThemeMode = 'system';
            source = 'system';
          }
        } else {
          // Anonymous or no user - use anonymous dual theme preferences
          const anonymousTheme = getAnonymousThemePreference();
          const anonymousThemeMode = getAnonymousThemeModePreference();

          if (anonymousThemeMode) {
            currentThemeMode = anonymousThemeMode;
            source = 'anonymous';
          } else if (anonymousTheme) {
            // Legacy anonymous theme - convert to theme mode
            currentThemeMode = getThemeModeFromTheme(anonymousTheme);
            source = 'anonymous';
          } else {
            currentThemeMode = 'system';
            source = 'system';
          }

          // Clear authenticated theme cache when anonymous
          localStorage.removeItem("app-theme");
        }

        // Update state with dual theme preferences
        setLightThemeState(currentLightTheme);
        setDarkThemeState(currentDarkTheme);
        setThemeModeState(currentThemeMode);
        setThemeSource(source);

        // Resolve the actual theme to display
        const systemTheme = getSystemTheme();
        const resolvedTheme = resolveThemeFromMode(currentThemeMode, currentLightTheme, currentDarkTheme, systemTheme);
        
        setThemeState(resolvedTheme);
        document.documentElement.setAttribute("data-theme", resolvedTheme);

        // Cache dual theme preferences and resolved theme for layout script
        if (typeof window !== "undefined") {
          if (player && !player.isAnonymous) {
            localStorage.setItem('user-light-theme', currentLightTheme);
            localStorage.setItem('user-dark-theme', currentDarkTheme);
            localStorage.setItem('user-theme-mode', currentThemeMode);
          }
          localStorage.setItem('app-theme-resolved', resolvedTheme);
          localStorage.setItem('app-theme-system-state', isThemeDark(systemTheme) ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error initializing dual theme:', error);
        const fallbackTheme = getSystemTheme();
        setThemeState(fallbackTheme);
        setThemeSource('system');
        setThemeModeState('system');
        document.documentElement.setAttribute("data-theme", fallbackTheme);
      } finally {
        setThemeLoading(false);
      }
    };

    initializeDualTheme();
  }, [player, authLoading]);

  // Sync with localStorage changes from other tabs and system theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleStorageChange = (e: StorageEvent) => {
        if ((e.key === "app-theme" || e.key === "anonymous-theme" || e.key === "anonymous-theme-mode") && e.newValue) {
          if (e.key === "anonymous-theme-mode") {
            const newThemeMode = e.newValue as 'system' | 'light' | 'dark';
            if (['system', 'light', 'dark'].includes(newThemeMode)) {
              setThemeModeState(newThemeMode);
              // Recalculate theme based on new mode
              const systemTheme = getSystemTheme();
              const resolvedTheme = resolveThemeFromMode(newThemeMode, lightTheme, darkTheme, systemTheme);
              setThemeState(resolvedTheme);
              document.documentElement.setAttribute("data-theme", resolvedTheme);
            }
          } else {
            const newTheme = e.newValue as Theme;
            if (newTheme in AVAILABLE_THEMES) {
              setThemeState(newTheme);
              document.documentElement.setAttribute("data-theme", newTheme);
            }
          }
        }
      };

      // Listen for system theme changes
      try {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
          // Only update if user is in system mode
          if (themeMode === 'system') {
            const newSystemTheme = e.matches ? darkTheme : lightTheme;
            setThemeState(newSystemTheme);
            document.documentElement.setAttribute("data-theme", newSystemTheme);
            
            // Update resolved theme cache
            localStorage.setItem('app-theme-resolved', newSystemTheme);
            localStorage.setItem('app-theme-system-state', e.matches ? 'dark' : 'light');
          }
        };

        window.addEventListener("storage", handleStorageChange);
        mediaQuery.addEventListener("change", handleSystemThemeChange);
        
        return () => {
          window.removeEventListener("storage", handleStorageChange);
          mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
      } catch {
        // If matchMedia is not available, just handle storage changes
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
      }
    }
  }, [themeMode, lightTheme, darkTheme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeLoading(true);
    
    try {
      setThemeState(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);

      if (player && !player.isAnonymous) {
        // Authenticated user - save to Firebase and cache locally
        await setPlayerTheme(player.uid, newTheme);
        localStorage.setItem("app-theme", newTheme);
        setThemeSource('user');
      } else {
        // Anonymous user - save to localStorage only
        localStorage.setItem("anonymous-theme", newTheme);
        setThemeSource('anonymous');
      }
    } catch (error) {
      console.error('Error setting theme:', error);
      // Theme was already set in UI, just update source
      if (player && !player.isAnonymous) {
        // Still cache locally even if Firebase fails
        localStorage.setItem("app-theme", newTheme);
        setThemeSource('user');
      } else {
        localStorage.setItem("anonymous-theme", newTheme);
        setThemeSource('anonymous');
      }
    } finally {
      setThemeLoading(false);
    }
  };


  const setLightTheme = async (newLightTheme: Theme) => {
    setThemeLoading(true);
    
    try {
      setLightThemeState(newLightTheme);
      
      // Update actual theme if we're in light mode or if system mode would use this light theme
      const shouldUpdateTheme = themeMode === 'light' || (themeMode === 'system' && !getSystemPrefersDark());
      if (shouldUpdateTheme) {
        setThemeState(newLightTheme);
        document.documentElement.setAttribute("data-theme", newLightTheme);
      }

      if (player && !player.isAnonymous) {
        await setPlayerLightTheme(player.uid, newLightTheme);
        setThemeSource('user');
        // Update localStorage cache for layout script
        localStorage.setItem('user-light-theme', newLightTheme);
      }
      
      // Update resolved theme cache if this theme is currently active
      if (shouldUpdateTheme) {
        localStorage.setItem('app-theme-resolved', newLightTheme);
        const systemState = getSystemPrefersDark() ? 'dark' : 'light';
        localStorage.setItem('app-theme-system-state', systemState);
      }
    } catch (error) {
      console.error('Error setting light theme:', error);
    } finally {
      setThemeLoading(false);
    }
  };

  const setDarkTheme = async (newDarkTheme: Theme) => {
    setThemeLoading(true);
    
    try {
      setDarkThemeState(newDarkTheme);
      
      // Update actual theme if we're in dark mode or if system mode would use this dark theme
      const shouldUpdateTheme = themeMode === 'dark' || (themeMode === 'system' && getSystemPrefersDark());
      if (shouldUpdateTheme) {
        setThemeState(newDarkTheme);
        document.documentElement.setAttribute("data-theme", newDarkTheme);
      }

      if (player && !player.isAnonymous) {
        await setPlayerDarkTheme(player.uid, newDarkTheme);
        setThemeSource('user');
        // Update localStorage cache for layout script
        localStorage.setItem('user-dark-theme', newDarkTheme);
      }
      
      // Update resolved theme cache if this theme is currently active
      if (shouldUpdateTheme) {
        localStorage.setItem('app-theme-resolved', newDarkTheme);
        const systemState = getSystemPrefersDark() ? 'dark' : 'light';
        localStorage.setItem('app-theme-system-state', systemState);
      }
    } catch (error) {
      console.error('Error setting dark theme:', error);
    } finally {
      setThemeLoading(false);
    }
  };

  const setThemeMode = async (newThemeMode: 'system' | 'light' | 'dark') => {
    setThemeLoading(true);
    
    try {
      setThemeModeState(newThemeMode);
      
      // Calculate and apply the new theme based on mode
      const systemTheme = getSystemTheme();
      const resolvedTheme = resolveThemeFromMode(newThemeMode, lightTheme, darkTheme, systemTheme);
      setThemeState(resolvedTheme);
      document.documentElement.setAttribute("data-theme", resolvedTheme);

      if (player && !player.isAnonymous) {
        await setPlayerThemeMode(player.uid, newThemeMode);
        setThemeSource('user');
        // Update localStorage cache for layout script
        localStorage.setItem('user-theme-mode', newThemeMode);
      } else {
        localStorage.setItem("anonymous-theme-mode", newThemeMode);
        setThemeSource('anonymous');
      }
      
      // Update resolved theme cache
      localStorage.setItem('app-theme-resolved', resolvedTheme);
      localStorage.setItem('app-theme-system-state', isThemeDark(systemTheme) ? 'dark' : 'light');
    } catch (error) {
      console.error('Error setting theme mode:', error);
    } finally {
      setThemeLoading(false);
    }
  };

  const setAnonymousThemeMode = (newThemeMode: 'system' | 'light' | 'dark') => {
    setThemeModeState(newThemeMode);
    
    // For anonymous users, use default light and dark themes
    const anonymousLightTheme: Theme = DEFAULT_LIGHT_THEME;
    const anonymousDarkTheme: Theme = DEFAULT_DARK_THEME;
    const systemTheme = getSystemTheme();
    const resolvedTheme = resolveThemeFromMode(newThemeMode, anonymousLightTheme, anonymousDarkTheme, systemTheme);
    
    setThemeState(resolvedTheme);
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    localStorage.setItem("anonymous-theme-mode", newThemeMode);
    setThemeSource('anonymous');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        setTheme, 
        themes: Object.keys(AVAILABLE_THEMES) as readonly Theme[],
        getSystemTheme,
        getSystemPrefersDark,
        themeLoading,
        themeSource,
        lightTheme,
        darkTheme,
        themeMode,
        setLightTheme,
        setDarkTheme,
        setThemeMode,
        setAnonymousThemeMode
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