"use client";

import { useState } from "react";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { createRoom } from "@/lib/firebase/room";
import { useAuth } from "@/app/contexts/auth";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const { joinRoom } = useJoinRoom();
  const { player } = useAuth();
      
  const handleCreateNewRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      try { 
        const roomId = await createRoom(roomName, player?.uid);
        await joinRoom(roomId);
      }catch (error) {
        console.error("Error creating room:", error);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleCreateNewRoomSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Enter Room Name"
          className={`input input-bordered min-w-64 text-base`}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          required
          minLength={2}
          maxLength={25}
        />
        <button
          type="submit"
          className="btn btn-primary min-w-34 text-base"
        >
          Create Room
        </button>
      </form>
    </>
  );
}; 

export default CreateRoom;