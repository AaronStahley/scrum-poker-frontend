"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const CreateRoom = () => {
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();

  const createRoom = async () => {
    try {
      const roomRef = await addDoc(collection(db, "rooms"), {
        createdAt: new Date(),
        players: [{ id: getOrCreateUserId(), name: playerName, selection: null }],
        status: "waiting",
      });
      router.push(`/room/${roomRef.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const getOrCreateUserId = () => {
    let playerId = localStorage.getItem("playerId");

    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem("playerId", playerId);
    }

    return playerId;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      createRoom();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
      <input
        type="text"
        placeholder="Enter Player Name"
        className={`input input-bordered min-w-64`}
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        required
        minLength={2}
        maxLength={25}
      />
      <button
        type="submit"
        className="btn btn-primary min-w-30"
      >
        Create Room
      </button>
    </form>
  );
}; 

export default CreateRoom