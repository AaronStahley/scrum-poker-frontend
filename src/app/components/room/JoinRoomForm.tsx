"use client";

import { useState } from "react";
import useJoinRoom from "@/app/hooks/JoinRoom";
import { XCircleIcon } from '@heroicons/react/20/solid';

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const { joinRoom } = useJoinRoom();
  const [error, setError] = useState("");

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

  return (
    <>
      <form onSubmit={handleJoinRoomSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Existing Room ID"
          name="roomId"
          className={`input input-bordered min-w-64`}
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          required
          minLength={20}
          maxLength={20}
          // pattern="^[a-zA-Z0-9]{20}$" //TODO: figure out how to use this with custom message
        />
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