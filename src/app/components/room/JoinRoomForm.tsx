"use client";

import { useState, useEffect } from "react";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { XCircleIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { collectionGroup, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
// import { getPreviousRooms } from "@/lib/firebase/player";
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

  const handleJoinRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      try { 
        await joinRoom( roomId );
      } catch (error) {
        setError("Room does not exist");
        console.error("Error joining room:", error);
      }
    }
  }

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && !target.closest(".dropdown-content")) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (loading || !player) return;

    getPreviousRooms(player.uid).then((rooms: Room[]) => {
      console.log("Previous Rooms:", rooms);
      setPreviousRooms(rooms);
    }).catch((error) => {
      console.error("Error fetching previous rooms:", error);
    });

  }, [loading, player]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (item: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click event from propagating to the document
    setRoomId(item);
    setShowDropdown(false);
  };

  return (
    <>
    <form onSubmit={handleJoinRoomSubmit} className="flex flex-col sm:flex-row items-start gap-4">
      <div className={`dropdown dropdown-bottom ${showDropdown ? "open" : "closed"}`}>
        <label className="input input-bordered flex items-center gap-2">
            <input 
              type="text" 
              className="min-w-64" 
              placeholder="Existing Room Name"
              name="roomName"
              value={previousRooms.find((room) => room.id === roomId)?.name || roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onClick={() => setShowDropdown(true)}
              required
              minLength={20}
              maxLength={20}
            />
            <ChevronDownIcon className="w-6 h-6" />
        </label>
        <ul className="dropdown-content menu bg-base-100 rounded-box z-1 min-w-64 p-2 shadow-sm">
          {previousRooms.length ? (
                previousRooms.map((previousRoom) => (
                  <li key={previousRoom.id} onClick={(e) => handleSelect(previousRoom.id, e)}>
                    <a>{previousRoom.name}</a>
                  </li>
              ))
            ) : (
              <li>No results found</li>
            )}
        </ul>
      </div>
      <button
        type="submit"
        className="btn btn-secondary min-w-30"
      >
        Join Room
      </button>
    </form>
    {error &&
      <div role="alert" className="alert alert-error rounded-md">
      <XCircleIcon className="h-6 w-6" />
      <span>{error}</span>
    </div>
    }
    </>
  )
}

export default JoinRoom