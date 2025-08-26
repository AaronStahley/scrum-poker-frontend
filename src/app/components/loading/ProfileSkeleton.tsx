import React from 'react'

const ProfileSkeleton = () => {
  return (
    <div className="sm:flex gap-2">
      <div className="btn btn-circle bg-base-300 animate-pulse w-12 h-12">
        <div className="w-10 h-10 bg-base-300 rounded-full"></div>
      </div>
    </div>
  );
}

export default ProfileSkeleton