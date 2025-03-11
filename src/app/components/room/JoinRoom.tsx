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

    if (!roomId.trim()) return;

    if (roomSnap.exists()) {
      router.push(`/room/${roomId}`);
    } else {
      alert("Room not found");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        placeholder="Existing Room ID"
        className="input input-bordered min-w-64"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button className="btn btn-secondary min-w-35" onClick={joinRoom}>
        Join Room
      </button>
    </div>
  )
}

export default JoinRoom