'use client';

import React from 'react'
import { useState } from "react";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import NewPlayerModal from './NewPlayerModal';


interface Player {
    id: string;
    name: string;
    selection: number | string | null;
}

interface RoomProps {
    db: any;
    roomId: string;
    players: Player[];
  }

const CreateNewPlayer: React.FC<RoomProps> = ({ db, roomId, players }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const checkIfPlayerExists = (players: Player[], playerId: string) => {
    return players.some((player: Player) => player.id === playerId);
  }

  let playerExists = checkIfPlayerExists(players, localStorage.getItem("playerId") || "");

  const createNewPlayer = (name: string) => {
    let newPlayer = {id: crypto.randomUUID(), name: name, selection: null};
    localStorage.setItem("playerId", newPlayer.id);
    return newPlayer;
  }

  const handleNewPlayerSubmit = async (name: string) => {
    let newPlayer = createNewPlayer(name);
    setPlayerName(newPlayer.name);

    const roomRef = doc(db, "rooms", roomId);

    try {
      // Update the room document by adding the new player to the players array
      await updateDoc(roomRef, {players: arrayUnion(createNewPlayer(playerName))}); 
      console.log("Player added to the room successfully!");
    } catch (error) {
      console.error("Error adding player to the room:", error);
    }
  };

  if(!playerExists) {
    openModal()
  }

  return (
    <>
        <NewPlayerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleNewPlayerSubmit}
        />
    </>
  )
}

export default CreateNewPlayer