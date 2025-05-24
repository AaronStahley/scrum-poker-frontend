"use client";

import { useState, useEffect } from "react";
import PlayerTable from "../player/PlayerTable"
import PlayingCardSelector from "../card/PlayingCardSelector";
import { useAuth } from "@/app/contexts/auth";
import useJoinRoom from "@/app/hooks/useJoinRoom";
import { updatePlayers, updatePlayer } from "@/lib/firebase/player";
import { updateRoom, removePlayerFromRoom } from "@/lib/firebase/room";
import { usePlayersInRoom } from "@/app/hooks/usePlayersInRoom";
import { useCurrentRoom } from "@/app/hooks/useCurrentRoom";

const RoomClient = ({ roomId }: { roomId: string }) => {
  const { player: playerAuth } = useAuth();
  const [revealVotes, setRevealVotes] = useState(false);
  const [resetCardSelector, setResetCardSelector] = useState(false);
  const {} = useJoinRoom({autoJoinRoomId: roomId});
  const { players } = usePlayersInRoom(roomId);
  const { room } = useCurrentRoom(roomId);

  const updatePlayerSelection = async (playerId: string, selection: string | number) => {
    setResetCardSelector(false);
    updatePlayer(playerId, { selection });
  };

  const resetVotes = async () => {
    await updatePlayers(roomId, { selection: null });
    await updateRoom(roomId, { status: "waiting" });
  };

  const handlRevealVotes = async () => {
    await updateRoom(roomId, { status: "revealed" });
  }

  const removePlayer = async (id: string) => {
    await removePlayerFromRoom(roomId, id);
  };

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