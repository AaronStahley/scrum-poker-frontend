"use client";

import { useTheme } from "@/app/contexts/theme";
import { useAuth } from "@/app/contexts/auth";
import { ComputerDesktopIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

const ThemeModeSelector = () => {
  const { themeMode, setThemeMode, setAnonymousThemeMode, getSystemPrefersDark } = useTheme();
  const { player } = useAuth();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detect system theme preference using safe theme context utility
  useEffect(() => {
    setSystemPrefersDark(getSystemPrefersDark());
    
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [getSystemPrefersDark]);

  const handleThemeModeChange = (newMode: 'system' | 'light' | 'dark') => {
    if (player && !player.isAnonymous) {
      setThemeMode(newMode);
    } else {
      setAnonymousThemeMode(newMode);
    }
  };

  const themeModeOptions = [
    {
      value: 'system' as const,
      label: 'System',
      icon: ComputerDesktopIcon,
      description: 'Follow system preference'
    },
    {
      value: 'light' as const,
      label: 'Light',
      icon: SunIcon,
      description: player && !player.isAnonymous ? 'Use light theme' : 'Corporate theme'
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: MoonIcon,
      description: player && !player.isAnonymous ? 'Use dark theme' : 'Business theme'
    }
  ];

  // Determine which icon to show on the button
  const getButtonIcon = () => {
    switch (themeMode) {
      case 'light':
        return SunIcon;
      case 'dark':
        return MoonIcon;
      case 'system':
      default:
        // For system mode, show sun or moon based on system preference
        return systemPrefersDark ? MoonIcon : SunIcon;
    }
  };

  const ButtonIcon = getButtonIcon();
  const currentOption = themeModeOptions.find(option => option.value === themeMode);

  return (
    <div className="dropdown dropdown-end">
      <div 
        tabIndex={0} 
        role="button" 
        className="btn btn-ghost btn-circle"
        aria-label={`Current theme mode: ${currentOption?.label}. Click to change theme mode.`}
      >
        <ButtonIcon className="h-5 w-5" />
      </div>
      
      <ul 
        tabIndex={0} 
        className="dropdown-content menu bg-base-100 border border-base-300 rounded-box z-[1] w-52 p-2 shadow-lg"
      >
        {themeModeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = themeMode === option.value;
          
          return (
            <li key={option.value}>
              <button
                onClick={() => handleThemeModeChange(option.value)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isSelected 
                    ? 'bg-primary/10 text-primary border border-primary/20' 
                    : 'hover:bg-base-200'
                }`}
                aria-pressed={isSelected}
                aria-describedby={`theme-mode-${option.value}-desc`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-base-content/70'}`} />
                <div className="flex-1 text-left">
                  <div className={`font-medium ${isSelected ? 'text-primary' : 'text-base-content'}`}>
                    {option.label}
                  </div>
                  <div 
                    id={`theme-mode-${option.value}-desc`}
                    className="text-xs text-base-content/60 mt-0.5"
                  >
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ThemeModeSelector;