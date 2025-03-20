"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import PlayerTable from "../player/PlayerTable"
import PlayingCardSelector from "../card/PlayingCardSelector";
import { Player } from "@/types/player";
import { useAuth } from "@/app/contexts/auth";

const RoomClient = ({ roomId }: { roomId: string }) => {
  const { player, loading } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [revealVotes, setRevealVotes] = useState(false);
  const [resetCardSelector, setResetCardSelector] = useState(false);
  const roomRef = doc(db, "rooms", roomId);

  useEffect(() => {
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const roomStatus = docSnap.data().status;
        const players = docSnap.data().players;

        setPlayers(players);
        
        if (roomStatus === "revealed") {
          setRevealVotes(true);
        }else {
          const votesReset = players.every((p : Player) => p.selection == null);
          if (votesReset) {
            setResetCardSelector(true)
          }
          setRevealVotes(false);
        }
      } else {
        setPlayers([]);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const updatePlayerSelection = async (playerId: string, selection: string | number) => {
    setResetCardSelector(false);
    await updateDoc(roomRef, {
      players: players.map((player) =>
        player.id === playerId ? { ...player, selection } : player
      ),
    });
  };

  const resetVotes = async () => {
    await updateDoc(roomRef, {
        status: "waiting",
        players: players.map((player) => ({
            ...player,
            selection: null,
        })),
    });
  };

  const handlRevealVotes = async () => {
    await updateDoc(roomRef, {
        status: "revealed",
    });
  }

  const removePlayer = (name: string) => {
    setPlayers((prevPlayers) => prevPlayers.filter((player) => player.name !== name));

    updateDoc(roomRef, {
      players: players.filter((player) => player.name !== name),
    });
  };

  if (loading) return <p>Loading players...</p>;

  return (
    <div>
    <PlayingCardSelector reset={resetCardSelector} playerId={player?.uid} onSelect={updatePlayerSelection} />
    <div className='flex flex-wrap gap-4 justify-center p-6'>
      <button className="text-base btn btn-primary" onClick={handlRevealVotes}>Reveal Votes</button>
      <button className="text-base btn btn-secondary" onClick={resetVotes}>Reset Votes</button>
    </div>
    {player &&(
      <PlayerTable currentPlayerId={player.uid} players={players} revealVotes={revealVotes} removePlayer={removePlayer} />
    )}
    </div>
  );
};

export default RoomClient;