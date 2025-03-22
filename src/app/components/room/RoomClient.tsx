"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import PlayerTable from "../player/PlayerTable"
import PlayingCardSelector from "../card/PlayingCardSelector";
import { Player } from "@/types/player";
import { useAuth } from "@/app/contexts/auth";
import useJoinRoom from "@/app/hooks/JoinRoom";
import { Room } from "@/types/room";

const RoomClient = ({ roomId }: { roomId: string }) => {
  const { player, loading } = useAuth();
  // const [players, setPlayers] = useState<Player[]>([]);
  const [room, setRoom] = useState<Room>();
  const [revealVotes, setRevealVotes] = useState(false);
  const [resetCardSelector, setResetCardSelector] = useState(false);
  const roomRef = doc(db, "rooms", roomId);
  const {} = useJoinRoom({autoJoinRoomId: roomId});

  useEffect(() => { 
    const roomRef = doc(db, "rooms", roomId);

    const unsubscribe = onSnapshot(roomRef, (roomSnap) => {
      if (roomSnap.exists()) {
        const room = roomSnap.data() as Room;
        setRoom(room);
        
        if (room.status === "revealed") {
          setRevealVotes(true);
        }else {
          const votesReset = room.players.every((p : Player) => p.selection == null);
          if (votesReset) {
            setResetCardSelector(true)
          }
          setRevealVotes(false);
        }
      } else {
        setRoom(undefined);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const updatePlayerSelection = async (playerId: string, selection: string | number) => {
    setResetCardSelector(false);
    await updateDoc(roomRef, {
      players: room?.players.map((player) =>
        player.id === playerId ? { ...player, selection } : player
      ),
    });
  };

  const resetVotes = async () => {
    await updateDoc(roomRef, {
        status: "waiting",
        players: room?.players.map((player) => ({
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

  const removePlayer = (id: string) => {
    if (room?.createdBy === id) return;

    setRoom((prevRoom) => {
      if (!prevRoom) return prevRoom;
      return {
        ...prevRoom,
        players: prevRoom.players.filter((player) => player.id !== id),
      };
    }); 

    updateDoc(roomRef, {
      players: room?.players.filter((player) => player.id !== id),
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
      <PlayerTable roomOwnerId={room?.createdBy} currentPlayerId={player.uid} players={room?.players ?? []} revealVotes={revealVotes} removePlayer={removePlayer} />
    )}
    </div>
  );
};

export default RoomClient;