"use client";

import { useTheme, Theme, AVAILABLE_THEMES } from "@/app/contexts/theme";
import ThemePreview from "./ThemePreview";
import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const ThemeSelector = () => {
  const { theme: currentTheme, setTheme, themes } = useTheme();
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

  // Filter themes based on search term and expand state
  const getFilteredThemes = (themeList: Theme[], isExpanded: boolean, popularThemes: Theme[]) => {
    const filtered = themeList.filter(theme => 
      theme.includes(searchTerm.toLowerCase()) && themes.includes(theme)
    );
    
    // If search is active, show all filtered themes
    if (searchTerm) {
      return filtered;
    }
    
    // Always show popular themes
    const filteredPopular = popularThemes.filter(theme => themes.includes(theme));
    
    // If collapsed, show only popular themes
    if (!isExpanded) {
      return filteredPopular;
    }
    
    // If expanded, show all themes
    return filtered;
  };

  const filteredLightThemes = getFilteredThemes(themeCategories.allLight, isLightExpanded, themeCategories.popularLight);
  const filteredDarkThemes = getFilteredThemes(themeCategories.allDark, isDarkExpanded, themeCategories.popularDark);

  const handleThemeSelect = (theme: Theme) => {
    setTheme(theme);
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
        <p className="text-sm text-base-content/70 mb-4">
          Choose your preferred theme. Changes are applied immediately and saved automatically.
        </p>
        
        {/* Current theme display */}
        <div className="mb-4 p-3 bg-base-200 rounded-lg">
          <div className="text-sm font-medium text-base-content/80 mb-1">
            Current Theme
          </div>
          <div className="text-base font-semibold capitalize">
            {currentTheme.replace(/[-_]/g, " ")}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search themes..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Theme sections */}
        <div className="space-y-6">
          {/* Light Themes Section */}
          {filteredLightThemes.length > 0 && (
            <div className="border border-base-300 rounded-lg bg-base-200 p-4">
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={toggleLightSection}
              >
                <h4 className="text-lg font-medium text-base-content">
                  Light Themes
                </h4>
                <div className="flex items-center gap-2">
                  {!isLightExpanded && !searchTerm && (
                    <span className="text-sm text-base-content/60">
                      {themeCategories.popularLight.length} of {themeCategories.allLight.length}
                    </span>
                  )}
                  <ChevronDownIcon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isLightExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredLightThemes.map((theme) => (
                  <ThemePreview
                    key={theme}
                    theme={theme as Theme}
                    isSelected={currentTheme === theme}
                    onClick={handleThemeSelect}
                  />
                ))}
              </div>
              
              {!isLightExpanded && !searchTerm && filteredLightThemes.length < themeCategories.allLight.length && (
                <div className="mt-4 text-center">
                  <button
                    onClick={toggleLightSection}
                    className="btn btn-sm btn-outline"
                  >
                    View All {themeCategories.allLight.length} Light Themes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Dark Themes Section */}
          {filteredDarkThemes.length > 0 && (
            <div className="border border-base-300 rounded-lg bg-base-200 p-4">
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={toggleDarkSection}
              >
                <h4 className="text-lg font-medium text-base-content">
                  Dark Themes
                </h4>
                <div className="flex items-center gap-2">
                  {!isDarkExpanded && !searchTerm && (
                    <span className="text-sm text-base-content/60">
                      {themeCategories.popularDark.length} of {themeCategories.allDark.length}
                    </span>
                  )}
                  <ChevronDownIcon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isDarkExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredDarkThemes.map((theme) => (
                  <ThemePreview
                    key={theme}
                    theme={theme as Theme}
                    isSelected={currentTheme === theme}
                    onClick={handleThemeSelect}
                  />
                ))}
              </div>
              
              {!isDarkExpanded && !searchTerm && filteredDarkThemes.length < themeCategories.allDark.length && (
                <div className="mt-4 text-center">
                  <button
                    onClick={toggleDarkSection}
                    className="btn btn-sm btn-outline"
                  >
                    View All {themeCategories.allDark.length} Dark Themes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {searchTerm && filteredLightThemes.length === 0 && filteredDarkThemes.length === 0 && (
            <div className="text-center py-8 text-base-content/60">
              No themes found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}
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