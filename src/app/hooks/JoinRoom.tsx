import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth";
import { useEffect } from "react";
import { addPlayerToRoom, isPlayerInRoom } from "@/lib/firebase/room";
import { createPlayer, playerExists } from "@/lib/firebase/player";

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
      if (!(await playerExists(player.uid))) {
        await createPlayer(player.uid, player.displayName);
      }

      if (!(await isPlayerInRoom(roomId, player.uid))) {
        await addPlayerToRoom(roomId, player.uid);
      }

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