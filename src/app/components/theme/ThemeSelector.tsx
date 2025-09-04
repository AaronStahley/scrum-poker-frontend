"use client";

import { useTheme, Theme, AVAILABLE_THEMES } from "@/app/contexts/theme";
import ThemePreview from "./ThemePreview";
import ThemeModeSelector from "./ThemeModeSelector";
import { useState, useEffect, useMemo } from "react";

const ThemeSelector = () => {
  const { 
    theme: currentTheme, 
    themes,
    lightTheme,
    darkTheme,
    setLightTheme,
    setDarkTheme
  } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLightExpanded, setIsLightExpanded] = useState(false);
  const [isDarkExpanded, setIsDarkExpanded] = useState(false);

  // Derive theme arrays from AVAILABLE_THEMES with popular/regular separation
  const themeCategories = useMemo(() => {
    // Popular themes (always shown)
    const popularLight = Object.entries(AVAILABLE_THEMES)
      .filter(([, config]) => !config.isDark && config.isPopular)
      .map(([name]) => name as Theme)
      .sort();
    
    const popularDark = Object.entries(AVAILABLE_THEMES)
      .filter(([, config]) => config.isDark && config.isPopular)
      .map(([name]) => name as Theme)
      .sort();

    // Non-popular themes (shown in accordion)
    const otherLight = Object.entries(AVAILABLE_THEMES)
      .filter(([, config]) => !config.isDark && !config.isPopular)
      .map(([name]) => name as Theme)
      .sort();
    
    const otherDark = Object.entries(AVAILABLE_THEMES)
      .filter(([, config]) => config.isDark && !config.isPopular)
      .map(([name]) => name as Theme)
      .sort();

    return {
      popularLight,
      popularDark,
      otherLight,
      otherDark,
      allLight: [...popularLight, ...otherLight],
      allDark: [...popularDark, ...otherDark]
    };
  }, []);

  // Auto-expand section containing current theme
  useEffect(() => {
    if (themeCategories.allLight.includes(currentTheme)) {
      setIsLightExpanded(true);
    } else if (themeCategories.allDark.includes(currentTheme)) {
      setIsDarkExpanded(true);
    }
  }, [currentTheme, themeCategories]);

  // Auto-expand sections when searching
  useEffect(() => {
    if (searchTerm) {
      setIsLightExpanded(true);
      setIsDarkExpanded(true);
    }
  }, [searchTerm]);

  // Get popular themes (always visible)
  const getPopularThemes = (popularThemes: Theme[]) => {
    if (searchTerm) {
      return popularThemes.filter(theme => 
        theme.includes(searchTerm.toLowerCase()) && themes.includes(theme)
      );
    }
    return popularThemes.filter(theme => themes.includes(theme));
  };

  // Get additional themes (shown when expanded)
  const getAdditionalThemes = (otherThemes: Theme[], isExpanded: boolean) => {
    if (!isExpanded) {
      return [];
    }
    
    if (searchTerm) {
      return otherThemes.filter(theme => 
        theme.includes(searchTerm.toLowerCase()) && themes.includes(theme)
      );
    }
    
    return otherThemes.filter(theme => themes.includes(theme));
  };

  const popularLightThemes = getPopularThemes(themeCategories.popularLight);
  const additionalLightThemes = getAdditionalThemes(themeCategories.otherLight, isLightExpanded);
  const popularDarkThemes = getPopularThemes(themeCategories.popularDark);
  const additionalDarkThemes = getAdditionalThemes(themeCategories.otherDark, isDarkExpanded);


  const handleLightThemeSelect = (theme: Theme) => {
    setLightTheme(theme);
  };

  const handleDarkThemeSelect = (theme: Theme) => {
    setDarkTheme(theme);
  };

  const toggleLightSection = () => {
    setIsLightExpanded(!isLightExpanded);
  };

  const toggleDarkSection = () => {
    setIsDarkExpanded(!isDarkExpanded);
  };

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-xl mb-4">
          App Appearance
        </h3>
        <p className="text-sm text-base-content/70 mb-6">
          Choose your preferred light and dark themes, then use the mode selector to switch between them.
        </p>

        {/* Theme Mode Selector */}
        <div className="mb-6 p-4 bg-base-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-base-content/80 mb-1">
                Theme Mode
              </div>
              <div className="text-xs text-base-content/60">
                Currently showing: <span className="font-medium capitalize">{currentTheme.replace(/[-_]/g, " ")}</span>
              </div>
            </div>
            <ThemeModeSelector />
          </div>
        </div>

        {/* Global Theme Search */}
        <div className="mb-8 p-4 bg-base-100 border border-base-300 rounded-lg">
          <div className="text-sm font-medium text-base-content/80 mb-3">
            🔍 Search All Themes
          </div>
          <input
            type="text"
            placeholder="Search both light and dark themes..."
            className="input input-sm input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="text-xs text-base-content/60 mt-2">
            Search filters themes in both sections. Expand sections to see more results.
          </div>
        </div>

        {/* Preferred Light Theme Section */}
        <div className="mb-6">
          <div className="border border-base-300 rounded-lg bg-base-200 p-4">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4" 
              onClick={toggleLightSection}
            >
              <div>
                <h4 className="text-lg font-medium text-base-content">
                  Preferred Light Theme
                </h4>
                <p className="text-sm text-base-content/60 mt-1">
                  Used when in Light mode or System mode on light preference
                </p>
              </div>
              <div className="text-sm text-base-content/60">
                Current: <span className="font-medium capitalize">{lightTheme.replace(/[-_]/g, " ")}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {popularLightThemes.map((theme) => (
                <ThemePreview
                  key={theme}
                  theme={theme as Theme}
                  isSelected={lightTheme === theme}
                  onClick={handleLightThemeSelect}
                />
              ))}
            </div>

            {!isLightExpanded && (
              <div className="mt-4 text-center">
                <button
                  onClick={toggleLightSection}
                  className="btn btn-sm btn-outline"
                >
                  View All {themeCategories.allLight.length} Light Themes
                </button>
              </div>
            )}

            {isLightExpanded && additionalLightThemes.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {additionalLightThemes.map((theme) => (
                    <ThemePreview
                      key={theme}
                      theme={theme as Theme}
                      isSelected={lightTheme === theme}
                      onClick={handleLightThemeSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {isLightExpanded && (
              <div className="mt-4 text-center">
                <button
                  onClick={toggleLightSection}
                  className="btn btn-sm btn-outline"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preferred Dark Theme Section */}
        <div className="mb-6">
          <div className="border border-base-300 rounded-lg bg-base-200 p-4">
            <div 
              className="flex items-center justify-between cursor-pointer mb-4" 
              onClick={toggleDarkSection}
            >
              <div>
                <h4 className="text-lg font-medium text-base-content">
                  Preferred Dark Theme
                </h4>
                <p className="text-sm text-base-content/60 mt-1">
                  Used when in Dark mode or System mode on dark preference
                </p>
              </div>
              <div className="text-sm text-base-content/60">
                Current: <span className="font-medium capitalize">{darkTheme.replace(/[-_]/g, " ")}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {popularDarkThemes.map((theme) => (
                <ThemePreview
                  key={theme}
                  theme={theme as Theme}
                  isSelected={darkTheme === theme}
                  onClick={handleDarkThemeSelect}
                />
              ))}
            </div>

            {!isDarkExpanded && (
              <div className="mt-4 text-center">
                <button
                  onClick={toggleDarkSection}
                  className="btn btn-sm btn-outline"
                >
                  View All {themeCategories.allDark.length} Dark Themes
                </button>
              </div>
            )}

            {isDarkExpanded && additionalDarkThemes.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {additionalDarkThemes.map((theme) => (
                    <ThemePreview
                      key={theme}
                      theme={theme as Theme}
                      isSelected={darkTheme === theme}
                      onClick={handleDarkThemeSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {isDarkExpanded && (
              <div className="mt-4 text-center">
                <button
                  onClick={toggleDarkSection}
                  className="btn btn-sm btn-outline"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Theme count */}
        <div className="mt-4 text-sm text-base-content/60 text-center">
          {themes.length} themes available
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;