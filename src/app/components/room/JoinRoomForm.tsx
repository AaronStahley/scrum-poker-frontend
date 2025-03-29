"use client";

import { useState, useEffect } from "react";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { XCircleIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { collectionGroup, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const { joinRoom } = useJoinRoom();
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [previousRooms, setPreviousRooms] = useState<any>([]); // Replace with your actual items

  const getPreviousRooms = async (playerId: string) => {
    const q = query(
      collectionGroup(db, "players"),
      where("id", "==", playerId)
    );
  
    const snapshot = await getDocs(q);
  
    const rooms: any = [];
  
    snapshot.forEach((doc) => {
      const playerData = doc.data();
      const roomRef = doc.ref.parent.parent; // `players` is a subcollection under the room
      rooms.push({
        roomId: roomRef?.id,
        ...playerData
      });
    });

    setPreviousRooms(rooms);
  }

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
    getPreviousRooms("VfIhoZtOgbQl2QdhbFGRM9OLnQu2")
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (item: string) => {
    setRoomId(item);
    setShowDropdown(false);
  };

  return (
    <>
      <form onSubmit={handleJoinRoomSubmit} className="flex flex-col sm:flex-row  items-start gap-4">
        <div>
        <label className="input input-bordered flex items-center gap-2">
          <input 
            type="text" 
            className="min-w-64" 
            placeholder="Existing Room Id"
            name="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onClick={() => setShowDropdown(true)}
            required
            minLength={20}
            maxLength={20}            
          />
          <ChevronDownIcon className="w-6 h-6" />
        </label>
        {showDropdown && (
          <ul className="menu dropdown-content bg-secondary-content rounded-box z-1 min-w-64 p-2 shadow-md">
            {previousRooms.length ? (
              previousRooms.map((previousRoom) => (
                <li
                  key={previousRoom}
                  onClick={() => handleSelect(previousRoom)}
                  className="cursor-pointer p-2 hover:bg-secondary"
                >
                  {previousRoom}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No results found</li>
            )}
          </ul>
        )}
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