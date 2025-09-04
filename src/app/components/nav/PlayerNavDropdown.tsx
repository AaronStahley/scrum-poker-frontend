"use client"

import React, { useState, useEffect } from 'react'
import Link from "next/link";
import { auth } from "@/lib/firebase/firebase"; 
import { signOut } from "firebase/auth";
import { UserIcon, ArrowLeftStartOnRectangleIcon, Cog6ToothIcon } from  "@heroicons/react/20/solid";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { getVersionDisplay } from "@/lib/version";
import { useTheme } from "@/app/contexts/theme";

const PlayerNavDropdown = () => {
  const { themeMode, setThemeMode } = useTheme();
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setSystemPrefersDark(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setSystemPrefersDark(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  const handleLinkClick = () => {
    // Close dropdown by removing focus from active element
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  };

  const handleThemeCycle = () => {
    // Cycle through: system -> light -> dark -> system
    const nextMode = themeMode === 'system' ? 'light' : 
                    themeMode === 'light' ? 'dark' : 'system';
    setThemeMode(nextMode);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return SunIcon;
      case 'dark':
        return MoonIcon;
      case 'system':
      default:
        return systemPrefersDark ? MoonIcon : SunIcon;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light Theme';
      case 'dark':
        return 'Dark Theme';
      case 'system':
      default:
        return 'System Theme';
    }
  };

  const handleLogout = async () => {
    handleLinkClick(); // Close dropdown first
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-primary btn-circle avatar transition-all duration-200 hover:scale-105">
            <div className="w-10 rounded-full">
            <UserIcon className="h-12 w-9.5" />
            </div>
        </div>
        <ul
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li>
              <button onClick={handleThemeCycle} className="flex items-center">
                {React.createElement(getThemeIcon(), { className: "h-8 w-8 pr-1" })}
                {getThemeLabel()}
              </button>
            </li>
            <li>
              <Link href="/settings" onClick={handleLinkClick}>
                <Cog6ToothIcon className="h-8 w-8 pr-1" />
                Settings
              </Link>
            </li>
            <div className="divider my-1"></div>
            <li>
              <Link href="/" onClick={handleLogout}>
                <ArrowLeftStartOnRectangleIcon className="h-8 w-8 pr-1" />
                Logout
              </Link>
            </li>
            <div className="divider my-1"></div>
            <li className="disabled">
              <span className="text-xs text-base-content/60 cursor-default">
                {getVersionDisplay()}
              </span>
            </li>
        </ul>
    </div>
  )
}

export default PlayerNavDropdown