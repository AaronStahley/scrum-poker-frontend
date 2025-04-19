import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth";
import { useEffect } from "react";
import { addPlayerToRoom } from "@/lib/firebase/room";
import { createPlayer, playerExists, updatePlayer } from "@/lib/firebase/player";

type UseJoinRoomOptions = {
  autoJoinRoomId?: string | null;
};

const useJoinRoom = ({ autoJoinRoomId }: UseJoinRoomOptions = {}) => {
  const router = useRouter();
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
      const playerExistsInDb = await playerExists(player.uid);
      if (!playerExistsInDb) {
        await createPlayer(player.uid, player.displayName);
      }

      await Promise.all([
        addPlayerToRoom(roomId, player.uid),
        updatePlayer(player.uid, {currentRoom: roomId, lastJoinedAt: new Date()}),
      ]);
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
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