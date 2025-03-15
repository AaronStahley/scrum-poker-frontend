"use client"

import React from 'react'
import Link from 'next/link'
import { Bars3Icon } from '@heroicons/react/20/solid'
import useAuthUser from "@/lib/auth";
import PlayerNavDropdown from './PlayerNavDropdown'

const TopNavBarRight = () => {
  const { player, loading } = useAuthUser();

  if(loading) return null;

  if(!player)  return (
    <div>
      <div className="hidden sm:flex gap-2">
        <Link href="/signup" className="btn bg-primary btn-ghost">Sign Up</Link>
        <Link href="/login" className="btn btn-ghost">Login</Link>
      </div>
      <div className="sm:hidden">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <button className="btn btn-square btn-ghost">
                <Bars3Icon className="h-6 w-6" />
            </button>
          </label>
          <ul
            tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-40 p-2 shadow"
          >
            <li>
              <Link href="/signup">Sign Up</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sm:flex gap-2">
      <PlayerNavDropdown />
    </div>
  )
}

export default TopNavBarRight