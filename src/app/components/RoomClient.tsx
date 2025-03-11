"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import PlayerTable from "./PlayerTable"
import PlayingCardSelector from "./PlayingCardSelector";
import CreateNewPlayer from "./CreateNewPlayer";

interface Player {
  id: string;
  name: string;
  selection: number | string | null;
}

const RoomClient = ({ roomId }: { roomId: string }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealVotes, setRevealVotes] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerExists, setPlayerExists] = useState(false);
  const [roomStatus, setRoomStatus] = useState<string | null>(null);

  useEffect(() => {
    let storedPlayerId = localStorage.getItem("playerId");
    setPlayerId(storedPlayerId);

    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        let roomStatus = docSnap.data().status;
        if (roomStatus === "revealed") {
          setRevealVotes(true);
        }else { 
          setRevealVotes(false);
        }
        setRoomStatus(roomStatus);
        let players = docSnap.data().players;
        setPlayers(players);
        const existingPlayer = players.some((player: Player) => player.id === storedPlayerId);
        setPlayerExists(existingPlayer);
      
      } else {
        setPlayers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const updatePlayerSelection = async (playerId: string, selection: string | number) => {
    const roomRef = doc(db, "rooms", roomId);

    console.log("Updating player selection", playerId, selection);

    await updateDoc(roomRef, {
      players: players.map((player) =>
        player.id === playerId ? { ...player, selection } : player
      ),
    });
  };

  const resetVotes = async () => {
    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
        status: "waiting",
        players: players.map((player) => ({
            ...player,
            selection: null,
        })),
    });
  };

  const handlRevealVotes = async () => {
    const roomRef = doc(db, "rooms", roomId);

    await updateDoc(roomRef, {
        status: "revealed",
    });
  }

  if (loading) return <p>Loading players...</p>;
  // if (!playerExists && !loading) return <CreateNewPlayer create={playerExists} db={db} roomId={roomId} players={players}/>

  return (
    <div>
    <CreateNewPlayer create={!playerExists} db={db} roomId={roomId} players={players}/>
    <PlayingCardSelector onSelect={updatePlayerSelection} />
    <div className='flex flex-wrap gap-4 justify-center p-6'>
      <button className="text-base btn btn-primary" onClick={handlRevealVotes}>Reveal Votes</button>
      <button className="text-base btn btn-secondary" onClick={resetVotes}>Reset Votes</button>
    </div>
    <PlayerTable players={players} revealVotes={revealVotes} />
    </div>
  );
};

export default RoomClient;
