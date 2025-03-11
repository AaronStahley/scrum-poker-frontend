"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";

const JoinRoom = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  
  const joinRoom = async () => {
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
      router.push(`/room/${roomId}`);
    } else {
      alert("Room not found");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      joinRoom();
    }
  }

  return (
  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
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
  )
}

export default JoinRoom