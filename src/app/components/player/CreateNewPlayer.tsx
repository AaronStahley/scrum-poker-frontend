'use client';

import React from 'react'
import { useState } from "react";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import NewPlayerModal from './NewPlayerModal';
import { Player } from '../../../types/player';

interface RoomProps {
    create: boolean; 
    db: any;
    roomId: string;
    players: Player[];
}

const CreateNewPlayer: React.FC<RoomProps> = ({ create, db, roomId, players }) => {
  const [isModalOpen, setIsModalOpen] = useState(create);
  const [playerName, setPlayerName] = useState("");
  // const openModal = () => setIsModalOpen(create);
  const closeModal = () => setIsModalOpen(false);

  const createNewPlayer = (name: string) => {
    let newPlayer = {id: crypto.randomUUID(), name: name, selection: null};
    localStorage.setItem("playerId", newPlayer.id);
    return newPlayer;
  }

  const handleNewPlayerSubmit = async (playerName: string) => {
    let newPlayer = createNewPlayer(playerName);
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