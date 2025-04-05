"use client";

import { useState, useEffect, useRef } from "react";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { XCircleIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { getPreviousRooms } from "@/lib/firebase/room";
import { useAuth } from "@/app/contexts/auth";
import { Room } from "@/types/room";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const { joinRoom } = useJoinRoom();
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [previousRooms, setPreviousRooms] = useState<Room[]>([]);
  const { player, loading } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !player) return;

    getPreviousRooms(player.uid).then(setPreviousRooms).catch((error) => {
      console.error("Error fetching previous rooms:", error);
    });
  }, [loading, player]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleJoinRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await joinRoom(roomId);
    } catch (err) {
      setError("Room does not exist");
      console.error("Error joining room:", err);
    }
  };

  const handleSelect = (id: string) => {
    setRoomId(id);
    setShowDropdown(false);
  };

  return (
    <>
      <form onSubmit={handleJoinRoomSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative min-w-64" ref={dropdownRef}>
          <label className="input input-bordered flex items-center gap-2 w-full">
            <input
              type="text"
              className="flex-1 text-base"
              placeholder="Existing Room Name"
              value={previousRooms.find((r) => r.id === roomId)?.name || roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              required
              minLength={20}
              maxLength={20}
            />
            {previousRooms.length > 0 && (
              <ChevronDownIcon className="w-6 h-6 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
            )}          
          </label>

          {showDropdown && previousRooms.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full bg-base-100 shadow rounded-box p-2">
              {(
                previousRooms.map((room) => (
                  <li key={room.id}>
                    <button
                      type="button"
                      className="block text-base w-full text-left hover:bg-base-200 px-2 py-1 rounded"
                      onClick={() => handleSelect(room.id)}
                    >
                      {room.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <button type="submit" className="btn btn-secondary min-w-34 text-base">
          Join Room
        </button>
      </form>

      {error && (
        <div role="alert" className="alert alert-error rounded-md mt-2">
          <XCircleIcon className="h-6 w-6" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
};

export default JoinRoom;
