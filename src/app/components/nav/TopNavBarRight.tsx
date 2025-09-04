"use client"

import React from 'react'
import Link from 'next/link'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { useAuth } from '@/app/contexts/auth'
import PlayerNavDropdown from './PlayerNavDropdown'
import NavBarSkeleton from '@/app/components/loading/NavBarSkeleton'
import ThemeModeSelector from '@/app/components/theme/ThemeModeSelector'

const TopNavBarRight = () => {
  const { player, loading } = useAuth();

  if(loading) return (
    <div className="transition-opacity duration-300 opacity-75" suppressHydrationWarning>
      <NavBarSkeleton />
    </div>
  );

  if(!player || player.isAnonymous)  return (
    <div className="transition-opacity duration-300 opacity-100" suppressHydrationWarning>
      <div className="hidden sm:flex gap-2 items-center">
        <ThemeModeSelector />
        <Link href="/signup" className="btn bg-primary btn-ghost text-base transition-all duration-200 hover:scale-105">Sign Up</Link>
        <Link href="/login" className="btn btn-ghost text-base transition-all duration-200 hover:scale-105">Login</Link>
      </div>
      <div className="sm:hidden">
        <div className="flex gap-1 items-center">
          <ThemeModeSelector />
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle transition-all duration-200 hover:scale-105">
              <button className="btn btn-square btn-ghost">
                  <Bars3Icon className="h-6 w-6" />
              </button>
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-base-100 rounded-box z-50 mt-3 w-40 p-2 shadow"
            >
              <li>
                <Link className="text-base" href="/signup">Sign Up</Link>
              </li>
              <li>
                <Link className="text-base" href="/login">Login</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sm:flex gap-2 transition-opacity duration-300 opacity-100" suppressHydrationWarning>
      <ThemeModeSelector />
      <PlayerNavDropdown />
    </div>
  )
}

export default TopNavBarRight