import { Theme, AVAILABLE_THEMES } from "@/app/contexts/theme";

// Default theme constants - centralized to avoid hardcoding throughout codebase
export const DEFAULT_LIGHT_THEME: Theme = 'corporate';
export const DEFAULT_DARK_THEME: Theme = 'business';
export const DEFAULT_THEME_MODE: 'system' | 'light' | 'dark' = 'system';

// Helper functions using AVAILABLE_THEMES metadata
export const isThemeDark = (theme: Theme): boolean => {
  return AVAILABLE_THEMES[theme]?.isDark ?? false;
};

export const isThemeLight = (theme: Theme): boolean => {
  return !AVAILABLE_THEMES[theme]?.isDark;
};

// Get appropriate default theme based on system preference
export const getDefaultThemeForMode = (isDarkMode: boolean): Theme => {
  return isDarkMode ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
};

// Theme mode determination based on theme metadata instead of hardcoded names
export const getThemeModeFromTheme = (theme: Theme): 'light' | 'dark' => {
  return isThemeDark(theme) ? 'dark' : 'light';
};

// Get display names for themes (can be enhanced later with proper localization)
export const getThemeDisplayName = (theme: Theme): string => {
  // Convert theme key to display name (capitalize and replace hyphens with spaces)
  return theme.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};