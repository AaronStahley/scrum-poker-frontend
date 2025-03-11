"use client";

import { useState, useEffect} from "react";

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

  useEffect(() => {
    // Close the modal when the isOpen prop changes and it's set to false
    if (!isOpen) {
      const modalElement = document.getElementById("my_modal_5") as HTMLDialogElement;
      if (modalElement) {
        modalElement.close();
      }
    }
  }, [isOpen]); // Close the modal whenever isOpen changes to false

  return (
    <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle" open={isOpen}>
        <div className="modal-box">
          <h2 className="text-xl font-bold mb-4">New Player's Name</h2>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input input-bordered w-full mb-4"
            placeholder="Enter your name"
          />
          <div className="modal-action">
            <button className="btn" onClick={handleSubmit}>
              Submit
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
    </dialog>
  );
};

export default NewPlayerModal;