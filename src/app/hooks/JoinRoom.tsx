import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Player } from "@/types/player";
import { useAuth } from "@/app/contexts/auth";
import { use, useEffect } from "react";

const useJoinRoom = () => {
  const router = useRouter();
  const { player, loading, setShowModal, setPendingRoomId } = useAuth();

  const joinRoom = async (roomId: string) => {
    if (!roomId) return;

    if (!player && !loading) {
      console.error("Player has not been authenticated, cannot join room.");
      setPendingRoomId(roomId);
      setShowModal(true);
      return;
    }

    if (!loading && player?.displayName) { 
      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnap = await getDoc(roomRef);
  
        if (!roomSnap.exists()) {
          throw new Error("Room not found");
        }
  
        // Check if the player is already in the room
        const roomData = roomSnap.data();
        const players = roomData.players || [];
        const playerInRoom = players.some((p: Player) => p.id === player?.uid);
  
        if (!playerInRoom) { 
  
          console.log("Player not found in the room, adding player.");
          console.log("Player Display Name: ", player.displayName);
          const newPlayer: Player = { id: player.uid, name: player.displayName, selection: null };
          
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
      } catch (error: unknown) {
        console.error("Error joining room:", error);
        if (error instanceof Error) {
          return error.message;
        }
        return String(error);
      }
    }
  };

  return { joinRoom };
};

export default useJoinRoom;