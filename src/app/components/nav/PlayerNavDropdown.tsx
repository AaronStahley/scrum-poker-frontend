"use client"

import React from 'react'
import Link from "next/link";
import { auth } from "@/lib/firebase/firebase"; 
import { signOut } from "firebase/auth";
import { UserIcon, ArrowLeftStartOnRectangleIcon, Cog6ToothIcon } from  "@heroicons/react/20/solid";
import { getVersionDisplay } from "@/lib/version";

const PlayerNavDropdown = () => {

  const handleLinkClick = () => {
    // Close dropdown by removing focus from active element
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
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