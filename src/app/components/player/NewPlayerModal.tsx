"use client";

import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string) => void;
}

const NewPlayerModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onSubmit(playerName);
      setPlayerName("");
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      const modalElement = document.getElementById("my_modal_5") as HTMLDialogElement;
      if (modalElement) {
        modalElement.close();
      }
    }
  }, [isOpen]);

  return (
    <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle" open={isOpen}>
        <div className="modal-box">
          <h2 className="text-xl font-bold mb-4">New Players Name</h2>
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
            <button
              className="btn btn-ghost"
              onClick={() => {
              // onClose();
              router.push('/');
              }}
            >
              Close
            </button>
          </div>
        </div>
    </dialog>
  );
};

export default NewPlayerModal;