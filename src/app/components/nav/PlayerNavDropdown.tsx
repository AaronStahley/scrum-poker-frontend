"use client"

import React from 'react'
import Link from "next/link";
import { auth } from "@/lib/firebase"; 
import { signOut } from "firebase/auth";
import { UserIcon, ArrowLeftStartOnRectangleIcon } from  "@heroicons/react/20/solid";

const PlayerNavDropdown = () => {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-primary btn-circle avatar">
            <div className="w-10 rounded-full">
            <UserIcon className="h-12 w-9.5" />
            </div>
        </div>
        <ul
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            {/* <li><Link href="/profile" className="justify-between">Edit Profile<span className="badge">New</span></Link></li> */}
            {/* <li><Link href="/settings">Settings</Link></li> */}
            {/* <li><Link href="/settings">Display</Link></li> */}
            <li>
              <Link href="/" onClick={handleLogout}>
                <ArrowLeftStartOnRectangleIcon className="h-8 w-8 pr-1" />
                Logout
              </Link>
            </li>
        </ul>
    </div>
  )
}

export default PlayerNavDropdown