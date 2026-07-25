"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PlayerTable from "../player/PlayerTable"
import PlayingCardSelector from "../card/PlayingCardSelector";
import { useAuth } from "@/app/contexts/auth";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { updatePlayers, updatePlayer } from "@/lib/firebase/player";
import { updateRoom, removePlayerFromRoom, deleteRoom, updateRoomName, updateRoomPermissions, updateRoomCardSequence, togglePlayerRole } from "@/lib/firebase/room";
import { usePlayersInRoom } from "@/app/hooks/usePlayersInRoom";
import { useCurrentRoom, ROOM_NOT_FOUND_ERROR } from "@/app/hooks/useCurrentRoom";
import { usePresenceBeacon } from "@/app/hooks/usePresenceBeacon";
import { usePlayersPresence } from "@/app/hooks/usePlayersPresence";
import { useDebouncedCallback } from "@/app/hooks/useDebounce";
import { useErrorHandler, getFirebaseErrorMessage } from "@/app/hooks/useErrorHandler";
import ErrorToast from "@/app/components/error/ErrorToast";
import HostSettingsModal from "./HostSettingsModal";
import VoteStatistics from "./VoteStatistics";
import JoinRoleModal from "./JoinRoleModal";
import { Cog6ToothIcon } from "@heroicons/react/20/solid";
import { PlayerRemovalPermission, CardSequenceType } from "@/types/room";

const RoomClient = ({ roomId }: { roomId: string }) => {
  const { player: playerAuth } = useAuth();
  const router = useRouter();
  const [revealVotes, setRevealVotes] = useState(false);
  const [resetCardSelector, setResetCardSelector] = useState(false);
  const [showHostSettings, setShowHostSettings] = useState(false);
  const { error, clearError, withErrorHandling } = useErrorHandler();
  
  const { showRoleModal, confirmRole, loadingRoom, error: joinError } = useJoinRoom({autoJoinRoomId: roomId});
  const { players } = usePlayersInRoom(roomId);
  const { room, loading: roomLoading, error: roomError } = useCurrentRoom(roomId);
  usePresenceBeacon(playerAuth?.uid);
  const presence = usePlayersPresence(players.map(p => p.id));

  const updatePlayerSelectionImmediate = useCallback(async (playerId: string, selection: string | number) => {
    // Validate that player can only update their own selection
    if (!playerAuth?.uid || playerId !== playerAuth.uid) {
      const errorMsg = 'You can only update your own card selection';
      console.error('Player can only update their own selection:', { 
        currentPlayer: playerAuth?.uid, 
        attemptedUpdate: playerId 
      });
      throw new Error(errorMsg);
    }

    setResetCardSelector(false);
    try {
      await updatePlayer(playerId, { selection });
    } catch (error: unknown) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  }, [playerAuth?.uid]);

  // Debounce rapid selections to prevent Firebase spam and wrap with error handling
  const { debouncedCallback: updatePlayerSelection } = useDebouncedCallback(
    withErrorHandling(updatePlayerSelectionImmediate),
    300 // 300ms delay
  );

  const resetVotes = withErrorHandling(async () => {
    await Promise.all([
      updatePlayers(roomId, { selection: null }),
      updateRoom(roomId, { status: "waiting" })
    ]);
  });

  const handlRevealVotes = withErrorHandling(async () => {
    await updateRoom(roomId, { status: "revealed" });
  });

  const removePlayer = withErrorHandling(async (id: string) => {
    await removePlayerFromRoom(roomId, id, playerAuth?.uid);
  });

  const handleUpdateRoomName = async (newName: string): Promise<void> => {
    if (!playerAuth?.uid) {
      throw new Error("You must be logged in to update room settings");
    }
    await updateRoomName(roomId, newName, playerAuth.uid);
  };

  const handleDeleteRoom = async (): Promise<void> => {
    if (!playerAuth?.uid) {
      throw new Error("You must be logged in to delete this room");
    }
    await deleteRoom(roomId, playerAuth.uid);
    router.push("/");
  };

  const handleTogglePlayerRole = withErrorHandling(async (playerId: string, currentlySpectator: boolean) => {
    if (!playerAuth?.uid) return;
    await togglePlayerRole(roomId, playerId, currentlySpectator);
    if (!currentlySpectator) {
      await updatePlayer(playerId, { selection: null });
    }
  });

  const handleUpdatePermissions = async (permissions: PlayerRemovalPermission): Promise<void> => {
    if (!playerAuth?.uid) {
      throw new Error("You must be logged in to update permissions");
    }
    await updateRoomPermissions(roomId, permissions, playerAuth.uid);
  };

  const handleUpdateCardSequence = async (cardSequence: CardSequenceType): Promise<void> => {
    if (!playerAuth?.uid) {
      throw new Error("You must be logged in to update the card sequence");
    }
    await updateRoomCardSequence(roomId, cardSequence, playerAuth.uid);
  };

  const isHost = playerAuth?.uid && room?.createdBy && room.createdBy !== 'anonymous' && playerAuth.uid === room.createdBy;
  const isSpectator = room?.spectators?.includes(playerAuth?.uid ?? '') ?? false;
  const spectatorIds = room?.spectators ?? [];

  // Handle room deletion - redirect when room no longer exists
  useEffect(() => {
    if (roomError?.message === ROOM_NOT_FOUND_ERROR) {
      // Give a brief moment for user to see what happened, then redirect
      const timer = setTimeout(() => {
        router.push('/?message=room-deleted');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [roomError, router]);

  // Handle player removal - redirect when current player is no longer in room
  // Guard against firing while a join is in progress (role modal showing or loading)
  useEffect(() => {
    if (showRoleModal || loadingRoom) return;
    if (playerAuth?.uid && players.length > 0) {
      const isCurrentPlayerInRoom = players.some(player => player.id === playerAuth.uid);
      if (!isCurrentPlayerInRoom) {
        const timer = setTimeout(() => {
          router.push('/?message=player-removed');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [players, playerAuth?.uid, router, showRoleModal, loadingRoom]);

  useEffect(() => {
    if (players.every(player => player.selection === null)) {
      setResetCardSelector(true);
    }
    if (room.status === "revealed") {
      setRevealVotes(true);
    } else {
      setRevealVotes(false);
    }
  }, [room, players]);

  
  // Show appropriate message while redirecting
  if (roomError?.message === ROOM_NOT_FOUND_ERROR) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="alert alert-warning max-w-md mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="font-bold">Room has been deleted</h3>
            <div className="text-xs">Redirecting to home page...</div>
          </div>
        </div>
        <div className="loading loading-dots loading-lg"></div>
      </div>
    );
  }

  // Show message when player was removed (not while a join is in progress)
  if (!showRoleModal && !loadingRoom && playerAuth?.uid && players.length > 0) {
    const isCurrentPlayerInRoom = players.some(player => player.id === playerAuth.uid);
    if (!isCurrentPlayerInRoom) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="alert alert-info max-w-md mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <h3 className="font-bold">You have been removed from the room</h3>
              <div className="text-xs">Redirecting to home page...</div>
            </div>
          </div>
          <div className="loading loading-dots loading-lg"></div>
        </div>
      );
    }
  }

  return (
    <div className="w-full">
      <ErrorToast error={error || joinError} onDismiss={clearError} />
      {showRoleModal && <JoinRoleModal onSelectRole={confirmRole} />}
      {!roomLoading && !isSpectator && <PlayingCardSelector reset={resetCardSelector} playerId={playerAuth?.uid} onSelect={updatePlayerSelection} cardSequence={room?.cardSequence} />}
      <div className='flex flex-wrap gap-4 justify-center p-6'>
        <button className="text-base btn btn-primary" onClick={handlRevealVotes}>Reveal Votes</button>
        <button className="text-base btn btn-secondary" onClick={resetVotes}>Reset Votes</button>
        {isHost && (
          <button 
            className="text-base btn btn-outline"
            onClick={() => setShowHostSettings(true)}
            title="Room Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
            Settings
          </button>
        )}
      </div>
      {revealVotes && <VoteStatistics players={players} spectatorIds={spectatorIds} cardSequence={room?.cardSequence} />}
      <PlayerTable
        initislSortDirection="asc"
        roomOwnerId={room?.createdBy}
        currentPlayerId={playerAuth?.uid ?? null}
        players={players}
        revealVotes={revealVotes}
        removePlayer={removePlayer}
        playerRemovalPermissions={room?.playerRemovalPermissions || 'host-only'}
        spectatorIds={spectatorIds}
        onToggleRole={handleTogglePlayerRole}
        presence={presence}
      />
      <HostSettingsModal
        isOpen={showHostSettings}
        onClose={() => setShowHostSettings(false)}
        currentRoomName={room?.name || ""}
        onUpdateRoomName={handleUpdateRoomName}
        onDeleteRoom={handleDeleteRoom}
        playerRemovalPermissions={room?.playerRemovalPermissions || 'host-only'}
        onUpdatePermissions={handleUpdatePermissions}
        cardSequence={room?.cardSequence || 'fibonacci'}
        onUpdateCardSequence={handleUpdateCardSequence}
      />
    </div>
  );
};

export default RoomClient;