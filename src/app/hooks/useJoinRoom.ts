import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth";
import { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { addPlayerToRoom, isPlayerInRoom, touchRoom } from "@/lib/firebase/room";
import { createPlayer, playerExists, updatePlayer } from "@/lib/firebase/player";
import { MIN_LOADING_MS } from "@/app/constants/loading";

type UseJoinRoomOptions = {
  autoJoinRoomId?: string | null;
};

const useJoinRoom = ({ autoJoinRoomId }: UseJoinRoomOptions = {}) => {
  const [loadingRoom, setLoadingRoom] = useState(!!autoJoinRoomId);
  const [isPending, startTransition] = useTransition();
  const loadingStartRef = useRef<number | null>(null);

  const waitMinDuration = useCallback(async () => {
    if (loadingStartRef.current !== null) {
      const elapsed = Date.now() - loadingStartRef.current;
      const remaining = MIN_LOADING_MS - elapsed;
      if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
    }
  }, []);
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

  // Tracks latest pendingRole without adding it to effect deps (avoids re-triggering join on role reset)
  const pendingRoleRef = useRef(pendingRole);
  useEffect(() => { pendingRoleRef.current = pendingRole; }, [pendingRole]);

  // Prevents the auto-join from re-firing when player or other deps change after the first run
  const hasAutoJoined = useRef(false);

  const joinRoomWithRole = useCallback(async (roomId: string, role: 'player' | 'spectator') => {
    if (!player?.displayName) return;

    try {
      loadingStartRef.current = Date.now();
      setLoadingRoom(true);
      const playerExistsInDb = await playerExists(player.uid);
      if (!playerExistsInDb) {
        await createPlayer(player.uid, player.displayName);
      }

      // Sequence these: if addPlayerToRoom fails (e.g. room deleted), updatePlayer
      // must not run — otherwise player.currentRoom points to a room they're not in.
      await addPlayerToRoom(roomId, player.uid, role);
      await updatePlayer(player.uid, { currentRoom: roomId, lastJoinedAt: new Date() });

      // Only navigate when joining from outside the room page (home page flow).
      // When autoJoinRoomId is set the user is already on the room page — navigating
      // to the same URL re-runs the server component and can hit RoomNotFound if the
      // room is deleted in the gap introduced by waitMinDuration.
      if (!autoJoinRoomId) {
        await waitMinDuration();
        startTransition(() => {
          router.push(`/room/${roomId}`);
        });
      }
    } catch (error) {
      console.error("Error joining room:", error);
      if (error instanceof Error) {
        setError(error.message || "An error occurred while joining the room.");
      } else {
        setError("An error occurred while joining the room.");
      }
    } finally {
      setLoadingRoom(false);
      setPendingRoomId(null);
      setPendingRole('player');
    }
  }, [player, router, startTransition, setPendingRoomId, setPendingRole, waitMinDuration, autoJoinRoomId]);

  const joinRoom = useCallback(async (roomId: string): Promise<boolean> => {

    if (!player || !player.displayName) {
      setShowCreateNewPlayerModal(true);
      setPendingRoomId(roomId);
      return true;
    }

    loadingStartRef.current = Date.now();
    setLoadingRoom(true);
    try {
      // If already in the room, just update presence without asking for role
      const alreadyInRoom = await isPlayerInRoom(roomId, player.uid);
      if (alreadyInRoom) {
        // Room creation seeds the creator's uid into the room's players array directly,
        // without creating their player profile doc — create it here if missing so the
        // updatePlayer below doesn't fail with NOT_FOUND.
        const playerExistsInDb = await playerExists(player.uid);
        if (!playerExistsInDb) {
          await createPlayer(player.uid, player.displayName);
        }
        await Promise.all([
          updatePlayer(player.uid, { currentRoom: roomId, lastJoinedAt: new Date() }),
          touchRoom(roomId),
        ]);
        if (!autoJoinRoomId) {
          await waitMinDuration();
          startTransition(() => {
            router.push(`/room/${roomId}`);
          });
        }
        return true;
      }
      // New joiner — show role selector.
      // setShowRoleModal(true) and setLoadingRoom(false) (from finally) are batched
      // atomically by React, so the redirect guard (showRoleModal || loadingRoom) stays true.
      setPendingJoinRoomId(roomId);
      setShowRoleModal(true);
      return true;
    } catch (err) {
      console.error("Error checking room membership:", err);
      setError(err instanceof Error ? (err.message || "An error occurred while joining the room.") : "An error occurred while joining the room.");
      return false;
    } finally {
      setLoadingRoom(false);
    }
  }, [player, setShowCreateNewPlayerModal, setPendingRoomId, router, startTransition, waitMinDuration, autoJoinRoomId]);

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
        joinRoomWithRole(pendingRoomId, pendingRoleRef.current);
      } else if (autoJoinRoomId && !hasAutoJoined.current) {
        hasAutoJoined.current = true;
        joinRoom(autoJoinRoomId).then(success => {
          if (!success) hasAutoJoined.current = false;
        });
      }
    }
  }, [autoJoinRoomId, loading, playerCreated, pendingRoomId, joinRoom, joinRoomWithRole]);

  return { joinRoom, loadingRoom, isPending, error, showRoleModal, confirmRole };
};

export default useJoinRoom;
