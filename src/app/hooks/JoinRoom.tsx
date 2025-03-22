import { useRouter, usePathname } from "next/navigation";
import { db } from "@/lib/firebase/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Player } from "@/types/player";
import { useAuth } from "@/app/contexts/auth";
import { useEffect } from "react";

type UseJoinRoomOptions = {
  autoJoinRoomId?: string | null;
};

const useJoinRoom = ({ autoJoinRoomId }: UseJoinRoomOptions = {}) => {
  const router = useRouter();
  const pathname = usePathname(); 
  const { 
    player, 
    loading, 
    setShowCreateNewPlayerModal, 
    playerCreated, 
    setPendingRoomId, 
    pendingRoomId 
  } = useAuth();

  const joinRoom = async (roomId: string) => {
    console.log("Joining room:", roomId);

    if (!player) {
      console.log("Player is not authenticated.");
      setShowCreateNewPlayerModal(true);
      setPendingRoomId(roomId);
      return;
    }

    if (!player.displayName) {
      console.log("Player does not have a display name.");
      return;
    }

    try { 
      const roomRef = doc(db, "rooms", roomId);
      const roomSnap = await getDoc(roomRef);

      //Check if the room exists
      if (!roomSnap.exists()) {
        console.error("Room not found:", roomId);
        throw new Error("Room not found");
      }

      //Check if the player is already in the room
      console.log("checking if player is in the room")
      const roomData = roomSnap.data();
      const createdBy = roomData.createdBy;
      const players = roomData.players || [];
      const playerInRoom = players.some((p: Player) => p.id === player?.uid);

      if (!playerInRoom) { 
        console.log("Player not found in the room, adding player.");
        console.log("Player Display Name: ", player.displayName);
        const newPlayer: Player = { id: player.uid, name: player.displayName, selection: null };

        await updateDoc(roomRef, {
          createdBy: createdBy === "anonymous" ? player.uid : createdBy, // If no createdBy this is a new room this person is creating.
          players: arrayUnion(newPlayer),
        });
        console.log("Player added to the room successfully!");
      }

      if (pathname !== `/room/${roomId}`) {
        router.push(`/room/${roomId}`);
      }

    } catch (error) { 
      throw error;
    }  
  };

  useEffect(() => {
    if (!loading){ 
      if (autoJoinRoomId) {
        joinRoom(autoJoinRoomId);
      }

      if (playerCreated && pendingRoomId) {
        joinRoom(pendingRoomId);
        setPendingRoomId(null);
      }
    }
  }, [autoJoinRoomId, loading, playerCreated, pendingRoomId, setPendingRoomId]);

  return { joinRoom };
};

export default useJoinRoom;