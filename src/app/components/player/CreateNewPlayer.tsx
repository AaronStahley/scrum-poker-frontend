'use client';

import React from 'react'
import { useState } from "react";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import NewPlayerModal from './NewPlayerModal';
import { Player } from '../../../types/player';
import { Firestore } from "firebase/firestore"; // Import Firestore type

interface RoomProps {
  create: boolean; 
  db: Firestore;
  roomId: string;
  players: Player[];
}

const CreateNewPlayer: React.FC<RoomProps> = ({ create, db, roomId }) => {
  const [isModalOpen, setIsModalOpen] = useState(create);
  const closeModal = () => setIsModalOpen(false);

  const createNewPlayer = (name: string) => {
    const newPlayer = {id: crypto.randomUUID(), name: name, selection: null};
    localStorage.setItem("playerId", newPlayer.id);
    return newPlayer;
  }

  const handleNewPlayerSubmit = async (playerName: string) => {
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