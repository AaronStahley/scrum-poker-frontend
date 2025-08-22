"use client";

import { useState, useEffect, useCallback } from "react";
import PlayerTable from "../player/PlayerTable"
import PlayingCardSelector from "../card/PlayingCardSelector";
import { useAuth } from "@/app/contexts/auth";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { updatePlayers, updatePlayer } from "@/lib/firebase/player";
import { updateRoom, removePlayerFromRoom } from "@/lib/firebase/room";
import { usePlayersInRoom } from "@/app/hooks/usePlayersInRoom";
import { useCurrentRoom } from "@/app/hooks/useCurrentRoom";
import { useDebouncedCallback } from "@/app/hooks/useDebounce";
import { useErrorHandler, getFirebaseErrorMessage } from "@/app/hooks/useErrorHandler";
import ErrorToast from "@/app/components/error/ErrorToast";

const RoomClient = ({ roomId }: { roomId: string }) => {
  const { player: playerAuth } = useAuth();
  const [revealVotes, setRevealVotes] = useState(false);
  const [resetCardSelector, setResetCardSelector] = useState(false);
  const { error, clearError, withErrorHandling } = useErrorHandler();
  
  const {} = useJoinRoom({autoJoinRoomId: roomId});
  const { players } = usePlayersInRoom(roomId);
  const { room } = useCurrentRoom(roomId);

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
    await removePlayerFromRoom(roomId, id);
  });

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

  
  return (
    <div>
      <ErrorToast error={error} onDismiss={clearError} />
      <PlayingCardSelector reset={resetCardSelector} playerId={playerAuth?.uid} onSelect={updatePlayerSelection} />
      <div className='flex flex-wrap gap-4 justify-center p-6'>
        <button className="text-base btn btn-primary" onClick={handlRevealVotes}>Reveal Votes</button>
        <button className="text-base btn btn-secondary" onClick={resetVotes}>Reset Votes</button>
      </div>
      <PlayerTable 
        initislSortDirection="asc"
        roomOwnerId={room?.createdBy}
        currentPlayerId={playerAuth?.uid ?? null}
        players={players}
        revealVotes={revealVotes}
        removePlayer={removePlayer} 
      />
    </div>
  );
};

export default RoomClient;