import { useRouter, usePathname } from "next/navigation";
import { db } from "@/lib/firebase/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Player } from "@/types/player";
import { useAuth } from "@/app/contexts/auth";
import { useEffect } from "react";

const useJoinRoom = () => {
  const router = useRouter();
  const pathname = usePathname(); 
  const { 
    player, 
    loading, 
    setShowModal, 
    setPlayerCreated, 
    playerCreated, 
    setPendingRoomId, 
    pendingRoomId 
  } = useAuth();

  const joinRoom = async (roomId: string) => {
    setPendingRoomId(roomId);

    if (!player && !loading) {
      console.error("Player has not been authenticated, cannot join room.");
      setShowModal(true);
      return;
    }

    if (player?.displayName && !loading) {
      console.info("Player has authenticated, joining room.");
      try {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnap = await getDoc(roomRef);
  
        if (!roomSnap.exists()) {
          console.error("Room not found:", roomId);
          throw new Error("Room not found");
        }
  
        console.log("checking if player is in the room")
        const roomData = roomSnap.data();
        const createdBy = roomData.createdBy;
        const players = roomData.players || [];
        const playerInRoom = players.some((p: Player) => p.id === player?.uid);
  
        if (!playerInRoom) { 
  
          console.log("Player not found in the room, adding player.");
          console.log("Player Display Name: ", player.displayName);
          const newPlayer: Player = { id: player.uid, name: player.displayName, selection: null };
          
          try {
            await updateDoc(roomRef, {
              createdBy: createdBy === "anonymous" ? player.uid : "", // If no createdBy this is a new room this person is creating.
              players: arrayUnion(newPlayer),
            });
            console.log("Player added to the room successfully!");
          } catch (error) {
            console.error("Error adding player to the room:", error);
          }
        }

        if (pathname !== `/room/${roomId}`) {
          router.push(`/room/${roomId}`);
        }
        // router.push(`/room/${roomId}`);
      } catch (error: unknown) {
        console.error("Error joining room:", error);
        if (error instanceof Error) {
          return error.message;
        }
        return String(error);
      }
    }
  };

  useEffect(() => {
    
    //TODO: I think there is an issue when joining directly from the URL when logged in. I think its here. 
    if (playerCreated && pendingRoomId && !loading) {
      console.log("Player created, joining room:", pendingRoomId);
      joinRoom(pendingRoomId);
      setPlayerCreated(false);
    }
  }, [playerCreated, pendingRoomId, loading]);

  return { joinRoom, playerCreated, setPlayerCreated, setPendingRoomId };
};

export default useJoinRoom;