import { Theme } from "@/app/contexts/theme";

export interface PlayerPreferences {
  theme?: Theme;
  lightTheme?: Theme;
  darkTheme?: Theme;
  themeMode?: 'system' | 'light' | 'dark';
}

export interface Player {
    id: string;
    name: string;
    selection: number | string | null;
    currentRoom: string | null;
    lastJoinedAt: Date;
    createdAt: Date;
    preferences?: PlayerPreferences;
  }
  