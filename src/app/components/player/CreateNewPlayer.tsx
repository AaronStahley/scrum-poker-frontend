'use client';

import React, { useEffect } from 'react'
import { useState } from "react";
import NewPlayerModal from './NewPlayerModal';
import { getAuth, signInAnonymously, updateProfile, User  } from "firebase/auth";

interface RoomProps {
  create: boolean;
  onPlayerCreated: (player: User | null) => void; 
}

const CreateNewPlayer: React.FC<RoomProps> = ({ create, onPlayerCreated }) => {
  const auth = getAuth();
  const [isModalOpen, setIsModalOpen] = useState(create);
  const closeModal = () => {
    onPlayerCreated(null);
    setIsModalOpen(false);
  }

  useEffect(() => {
    setIsModalOpen(create);
  }, [create]);

  const createNewPlayer = async (name: string) => {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    if (!name.trim()) return;
    try {
      await updateProfile(user!, { displayName: name });
      setIsModalOpen(false);
      onPlayerCreated(user);      
    } catch (error) {
      console.error("Error setting username:", error);
      onPlayerCreated(null); 
    }

    return auth.currentUser;
  }

  const handleNewPlayerSubmit = async (playerName: string) => {
    createNewPlayer(playerName);
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