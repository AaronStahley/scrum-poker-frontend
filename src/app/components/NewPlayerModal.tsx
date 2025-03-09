"use client";

import { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string) => void;
}

const NewPlayerModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [playerName, setPlayerName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onSubmit(playerName); // Call the onSubmit prop to handle the player name
      setPlayerName(""); // Clear the input field
      onClose(); // Close the modal
    }
  };

  if (!isOpen) return null; // Don't render if the modal is not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Enter Player Name</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Enter name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPlayerModal;