import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth";
import { useEffect, useState, useTransition, useCallback } from "react";
import { addPlayerToRoom, isPlayerInRoom } from "@/lib/firebase/room";
import { createPlayer, playerExists, updatePlayer } from "@/lib/firebase/player";

type UseJoinRoomOptions = {
  autoJoinRoomId?: string | null;
};

const useJoinRoom = ({ autoJoinRoomId }: UseJoinRoomOptions = {}) => {
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(<string | null>(null));
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingJoinRoomId, setPendingJoinRoomId] = useState<string | null>(null);
  const router = useRouter();
  const {
    player,
    loading,
    setShowCreateNewPlayerModal,
    playerCreated,
    setPendingRoomId,
    pendingRoomId,
    pendingRole,
    setPendingRole,
  } = useAuth();

  const joinRoomWithRole = useCallback(async (roomId: string, role: 'player' | 'spectator') => {
    if (!player?.displayName) return;

    try {
      setLoadingRoom(true);
      const playerExistsInDb = await playerExists(player.uid);
      if (!playerExistsInDb) {
        await createPlayer(player.uid, player.displayName);
      }

      await Promise.all([
        addPlayerToRoom(roomId, player.uid, role),
        updatePlayer(player.uid, { currentRoom: roomId, lastJoinedAt: new Date() }),
      ]);

      setPendingRoomId(null);
      setPendingRole('player');

      startTransition(() => {
        router.push(`/room/${roomId}`);
      });
    } catch (error) {
      console.error("Error joining room:", error);
      if (error instanceof Error) {
        setError(error.message || "An error occurred while joining the room.");
      } else {
        setError("An error occurred while joining the room.");
      }
    } finally {
      setLoadingRoom(false);
    }
  }, [player, router, startTransition, setPendingRoomId, setPendingRole]);

  const joinRoom = useCallback(async (roomId: string) => {
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

    // If already in the room, just update presence without asking for role
    const alreadyInRoom = await isPlayerInRoom(roomId, player.uid);
    if (alreadyInRoom) {
      await updatePlayer(player.uid, { currentRoom: roomId, lastJoinedAt: new Date() });
      startTransition(() => {
        router.push(`/room/${roomId}`);
      });
      return;
    }

    // New joiner — ask for role first
    setPendingJoinRoomId(roomId);
    setShowRoleModal(true);
  }, [player, setShowCreateNewPlayerModal, setPendingRoomId, router, startTransition]);

  const confirmRole = useCallback(async (role: 'player' | 'spectator') => {
    setShowRoleModal(false);
    if (pendingJoinRoomId) {
      setPendingJoinRoomId(null);
      await joinRoomWithRole(pendingJoinRoomId, role);
    }
  }, [pendingJoinRoomId, joinRoomWithRole]);

  useEffect(() => {
    if (!loading) {
      if (playerCreated && pendingRoomId) {
        joinRoomWithRole(pendingRoomId, pendingRole);
      } else if (autoJoinRoomId) {
        joinRoom(autoJoinRoomId);
      }
    }
  }, [autoJoinRoomId, loading, playerCreated, pendingRoomId, pendingRole, joinRoom, joinRoomWithRole]);

  return { joinRoom, loadingRoom, isPending, error, showRoleModal, confirmRole };
};

export default useJoinRoom;
