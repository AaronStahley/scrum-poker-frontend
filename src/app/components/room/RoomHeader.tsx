"use client";

import { useCurrentRoom } from "@/app/hooks/useCurrentRoom";

interface RoomHeaderProps {
  roomId: string;
  fallbackName?: string;
}

const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId, fallbackName }) => {
  const { room, loading, error } = useCurrentRoom(roomId);

  if (error) {
    return (
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-5">Select Your Story Point</h1>
        <p className="text-lg font-semibold mb-2">{fallbackName || "Room"}</p>
        <p className="text-md text-secondary">Room Id: {roomId}</p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h1 className="text-4xl font-bold mb-5">Select Your Story Point</h1>
      <p className="text-lg font-semibold mb-2">
        {loading ? (
          <span className="skeleton inline-block h-6 w-48"></span>
        ) : (
          room?.name || fallbackName || "Room"
        )}
      </p>
      <p className="text-md text-secondary">Room Id: {roomId}</p>
    </div>
  );
};

export default RoomHeader;