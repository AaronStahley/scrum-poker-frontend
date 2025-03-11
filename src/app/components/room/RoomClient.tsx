"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import PlayerTable from "../player/PlayerTable"
import PlayingCardSelector from "../card/PlayingCardSelector";
import CreateNewPlayer from "../player/CreateNewPlayer";
import { Player } from "@/types/player";

const RoomClient = ({ roomId }: { roomId: string }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealVotes, setRevealVotes] = useState(false);
  const [playerExists, setPlayerExists] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const roomRef = doc(db, "rooms", roomId);

  useEffect(() => {
    const storedPlayerId = localStorage.getItem("playerId");
    setPlayerId(storedPlayerId);

    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const roomStatus = docSnap.data().status;
        const players = docSnap.data().players;
        const existingPlayer = players.some((player: Player) => player.id === storedPlayerId);

        setPlayerExists(existingPlayer);
        setPlayers(players);

        if (roomStatus === "revealed") {
          setRevealVotes(true);
        }else { 
          setRevealVotes(false);
        }
      } else {
        setPlayers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const updatePlayerSelection = async (playerId: string, selection: string | number) => {
    // const roomRef = doc(db, "rooms", roomId);

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
    <CreateNewPlayer create={!playerExists} db={db} roomId={roomId} players={players}/>
    <PlayingCardSelector onSelect={updatePlayerSelection} />
    <div className='flex flex-wrap gap-4 justify-center p-6'>
      <button className="text-base btn btn-primary" onClick={handlRevealVotes}>Reveal Votes</button>
      <button className="text-base btn btn-secondary" onClick={resetVotes}>Reset Votes</button>
    </div>
    <PlayerTable currentPlayerId={playerId} players={players} revealVotes={revealVotes} removePlayer={removePlayer} />
    </div>
  );
};

export default RoomClient;
