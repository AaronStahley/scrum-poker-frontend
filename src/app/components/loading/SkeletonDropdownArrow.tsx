import React from 'react'

const SkeletonDropdownArrow = () => {
  return (
    <div className="w-6 h-6 flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-base-300 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}

export default SkeletonDropdownArrow