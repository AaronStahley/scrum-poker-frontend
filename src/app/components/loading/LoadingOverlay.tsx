import React from 'react'

const LoadingOverlay = () => {
  return (
      <div className="fixed inset-0 z-5 bg-[rgba(0,0,0,0.5)] flex items-center justify-center">
        <span className="loading loading-spinner text-primary w-20 h-20"></span>
      </div>
    );
}

export default LoadingOverlay