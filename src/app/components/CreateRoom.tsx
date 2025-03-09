"use client";

import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const CreateRoom = () => {
  let playerName = "";
  const router = useRouter();

  const setPlayerName = (e: any) => {
    playerName = e.target.value;
  }

  const getOrCreateUserId = () => {
    let playerId = localStorage.getItem("playerId");

    if (!playerId) {
      playerId = crypto.randomUUID();
      localStorage.setItem("playerId", playerId);
    }

    return playerId;
  }

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

  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        placeholder="Enter User Name"
        className="input input-bordered w-64"
        onChange={(e) => setPlayerName(e)}
      />
        <button className="btn btn-primary px-6" onClick={createRoom}>
          Create Room
        </button>
    </div>
  );
}; 

export default CreateRoom