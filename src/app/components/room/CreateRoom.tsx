"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { Room } from "../../../types/room";
import { useAuth } from "@/app/contexts/auth";
import CreateNewPlayer from "../player/CreateNewPlayer";
import { User } from "firebase/auth";

const CreateRoom = () => {
  const [createNewPlayer, setCreteNewPlayer] = useState(false);
  const [createNewRoom, setCreateNewRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const { player } = useAuth();
  const router = useRouter();

  const createRoom = useCallback (async () => {
    if (!player) {
      console.error("No player found, cannot create room.");
      return;
    }

    const playerId = player.uid;
    const playerName = player.displayName ? player.displayName : playerId;

    try {
      const newRoom: Room = {
        createdAt: new Date(),
        createdBy: playerId,
        name: roomName,
        status: "waiting",
        players: [{ id: playerId, name: playerName, selection: null }],
      };

      const roomRef = await addDoc(collection(db, "rooms"), newRoom);
      console.log("Room created successfully:", roomRef.id);
      router.push(`/room/${roomRef.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  }, [roomName, player, router]);

  const handleCreateNewRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      if (!player) { 
        setCreteNewPlayer(true);
        console.log("No player found, opening modal to create new player.");
        return;
      }

      setCreateNewRoom(true);
    }
  };

  const handlePlayerCreated = (newPlayer: User | null) => {
    if (newPlayer) {
      console.log("New player created:", newPlayer);
      setCreateNewRoom(true);
    } else {
      console.error("Failed to create new player.");
    }

    setCreteNewPlayer(false);
  };

  useEffect(() => {
    if (player && createNewRoom) {
      console.log("Creating new room for player: ", player.displayName);
      createRoom();
    }
  }, [player, createNewRoom, roomName, createRoom]); 

  return (
    <>
      <CreateNewPlayer create={createNewPlayer} onPlayerCreated={handlePlayerCreated} />
      <form onSubmit={handleCreateNewRoomSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <input
          type="text"
          placeholder="Enter Room Name"
          className={`input input-bordered min-w-64`}
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
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
    </>
  );
}; 

export default CreateRoom;