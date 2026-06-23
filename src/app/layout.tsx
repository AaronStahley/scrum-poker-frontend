import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavBar from "./components/nav/TopNavBar";
import AuthProviderWrapper from "../app/components/auth/AuthProviderWrapper";
import NewPlayerModal from "./components/player/NewPlayerModal";
import ErrorBoundary from "./components/error/ErrorBoundary";
import { ThemeProvider } from "./contexts/theme";
import { DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from "./constants/themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Scrum Poker",
  description: "Agile Scrum Estimation Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Safe system preference detection for SSR
                    function getSystemPrefersDark() {
                      if (typeof window !== "undefined" && window.matchMedia) {
                        try {
                          return window.matchMedia('(prefers-color-scheme: dark)').matches;
                        } catch {
                          return false;
                        }
                      }
                      return false;
                    }
                    
                    // Helper function to resolve theme based on dual theme system
                    function resolveThemeFromMode(themeMode, lightTheme, darkTheme, systemPrefersDark) {
                      switch (themeMode) {
                        case 'light':
                          return lightTheme;
                        case 'dark':
                          return darkTheme;
                        case 'system':
                        default:
                          return systemPrefersDark ? darkTheme : lightTheme;
                      }
                    }
                    
                    const systemPrefersDark = getSystemPrefersDark();
                    
                    // Check for cached resolved theme first (fastest path)
                    const cachedTheme = localStorage.getItem('app-theme-resolved');
                    const cachedSystemState = localStorage.getItem('app-theme-system-state');
                    const currentSystemState = systemPrefersDark ? 'dark' : 'light';
                    
                    // Use cached theme if system state hasn't changed
                    if (cachedTheme && cachedSystemState === currentSystemState) {
                      document.documentElement.setAttribute('data-theme', cachedTheme);
                      return;
                    }
                    
                    // Try to resolve using stored dual theme preferences
                    const lightTheme = localStorage.getItem('user-light-theme') || '${DEFAULT_LIGHT_THEME}';
                    const darkTheme = localStorage.getItem('user-dark-theme') || '${DEFAULT_DARK_THEME}';
                    const themeMode = localStorage.getItem('user-theme-mode') || 'system';
                    
                    const resolvedTheme = resolveThemeFromMode(themeMode, lightTheme, darkTheme, systemPrefersDark);
                    document.documentElement.setAttribute('data-theme', resolvedTheme);
                    
                    // Cache the resolved theme and system state for future loads
                    localStorage.setItem('app-theme-resolved', resolvedTheme);
                    localStorage.setItem('app-theme-system-state', currentSystemState);
                    return;
                    
                  } catch (e) {
                    // Final fallback using safe detection
                    const fallbackTheme = getSystemPrefersDark() ? '${DEFAULT_DARK_THEME}' : '${DEFAULT_LIGHT_THEME}';
                    document.documentElement.setAttribute('data-theme', fallbackTheme);
                  }
                })();
              `,
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base-200`}
          suppressHydrationWarning
        >
          <AuthProviderWrapper>
            <ThemeProvider>
              <ErrorBoundary>
                <TopNavBar />
                <NewPlayerModal />
                <main className="container mx-auto px-4 py-4">{children}</main>
              </ErrorBoundary>
            </ThemeProvider>
          </AuthProviderWrapper>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
  );
}
