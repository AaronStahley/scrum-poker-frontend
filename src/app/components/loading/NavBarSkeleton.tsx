import React from 'react'

const NavBarSkeleton = () => {
  return (
    <div>
      {/* Desktop skeleton */}
      <div className="hidden sm:flex gap-2">
        <div className="btn bg-base-300 animate-pulse text-transparent w-20">
          Button
        </div>
        <div className="btn bg-base-300 animate-pulse text-transparent w-16">
          Login
        </div>
      </div>
      
      {/* Mobile skeleton */}
      <div className="sm:hidden">
        <div className="btn btn-ghost btn-circle bg-base-300 animate-pulse">
          <div className="w-6 h-6 bg-base-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default NavBarSkeleton