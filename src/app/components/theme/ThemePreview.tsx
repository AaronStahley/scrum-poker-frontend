"use client";

import { Theme } from "@/app/contexts/theme";

interface ThemePreviewProps {
  theme: Theme;
  isSelected: boolean;
  onClick: (theme: Theme) => void;
}

const ThemePreview = ({ theme, isSelected, onClick }: ThemePreviewProps) => {
  const formatThemeName = (theme: string) => {
    return theme
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div 
      className={`
        cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 hover:scale-105
        ${isSelected 
          ? "border-primary shadow-lg ring-2 ring-primary ring-opacity-30" 
          : "border-base-300 hover:border-primary/50"
        }
      `}
      onClick={() => onClick(theme)}
      data-theme={theme}
    >
      {/* Theme preview colors */}
      <div className="flex gap-1 mb-2">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <div className="w-3 h-3 rounded-full bg-secondary"></div>
        <div className="w-3 h-3 rounded-full bg-accent"></div>
        <div className="w-3 h-3 rounded-full bg-base-200"></div>
      </div>
      
      {/* Theme name */}
      <div className="text-sm font-medium text-base-content">
        {formatThemeName(theme)}
      </div>
      
      {/* Mini preview components */}
      <div className="mt-2 space-y-1">
        <div className="w-full h-2 bg-base-200 rounded"></div>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-primary rounded"></div>
          <div className="w-4 h-2 bg-secondary rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;