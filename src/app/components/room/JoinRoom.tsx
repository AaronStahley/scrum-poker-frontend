"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/firebase";
import { getDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useAuth } from "@/app/contexts/auth";
import CreateNewPlayer from "../player/CreateNewPlayer";
import { User } from "firebase/auth";
import { Player } from "@/types/player";

const JoinRoom = () => {
  const [createNewPlayer, setCreteNewPlayer] = useState(false);
  const [navigateToRoom, setNavigateToRoom] = useState(false);
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const { player } = useAuth();

  const joinRoom = useCallback (async () => {
    if (!player) {
      console.error("No player found, cannot join room.");
      return;
    }

    const playerId = player.uid;
    const playerName = player.displayName ? player.displayName : playerId; 
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {

      // Check if the player is already in the room
      const roomData = roomSnap.data();
      const players = roomData.players || [];
      const playerExists = players.some((p: Player) => p.id === player?.uid);

      if (!playerExists) { 
        console.log("Player not found in the room, adding player.");
        const newPlayer: Player = { id: player?.uid, name: playerName, selection: null };
        
        try {
          await updateDoc(roomRef, {
            players: arrayUnion(newPlayer),
          });
          console.log("Player added to the room successfully!");
        } catch (error) {
          console.error("Error adding player to the room:", error);
        }
      }

      router.push(`/room/${roomId}`);
    } else {
      alert("Room not found");
    }
  }, [roomId, player, router]);

  const handleJoinRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    if (form.checkValidity()) {
      if (!player) { 
        console.log(player)
        setCreteNewPlayer(true);
        console.log("No player found, opening modal to create new player.");
        return;
      }

      setNavigateToRoom(true);
    }
  }

  const handlePlayerCreated = (newPlayer: User | null) => {
    if (newPlayer) {
      console.log("New player created:", newPlayer);
      setNavigateToRoom(true);
    } else {
      console.error("Failed to create new player.");
    }

    setCreteNewPlayer(false);
  };

  useEffect(() => {
    if (player && navigateToRoom) {
      console.log("Joining room for player: ", player.displayName);
      joinRoom();
    }
  }, [player, navigateToRoom, joinRoom]); 

  return (
    <>
      <CreateNewPlayer create={createNewPlayer} onPlayerCreated={handlePlayerCreated} />
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
    </>
  )
}

export default JoinRoom