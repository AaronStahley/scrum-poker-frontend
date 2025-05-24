"use client";

import { useState} from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { useAuth } from "@/app/contexts/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NewPlayerModal = () => {
  const [playerName, setPlayerName] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const { showCreateNewPlayerModal, setShowCreateNewPlayerModal, createNewAnonymousPlayer } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createNewAnonymousPlayer(playerName);
      setShowCreateNewPlayerModal(false);
      setPlayerName("");
    }
  };

  if(!showCreateNewPlayerModal) return null;

  return (
    <dialog id="my_modal_5" className="modal modal-middle text-center" open={true}>
      <div className="modal-box">
        <div>
          <h2 className="text-xl font-bold mb-3">Welcome!</h2>
          <p className="text-sm text-secondary mb-5">It looks like you are new here. Please enter your name to create a temporary account or {" "}
          <Link onClick={() => setShowCreateNewPlayerModal(false)} className="text-secondary underline" href="/login">Log In</Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter your name"
          />
          <QuestionMarkCircleIcon 
            onClick={() => setShowHelp(!showHelp)} 
            className="h-5 w-5 text-secondary cursor-pointer" 
          />
        </div>
        {showHelp && (
          <div className="my-4 p-4 bg-primarys border-1 rounded">
            <p className="text-sm text-primary-content">
              We will attempt to lookup if you have played before. If you have, you will be able to continue your game.
              Changing browsers or clearing your cache may result in a new player being created. To avoid this, please {" "}
              <Link onClick={() => setShowCreateNewPlayerModal(false)} className="text-secondary hover:underline" href="/login">Log In</Link> or{" "}
              <Link onClick={() => setShowCreateNewPlayerModal(false)} className="text-secondary hover:underline" href="/signup">Create an Account</Link>  
            </p>
          </div>
        )}
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleSubmit}>
            Join
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              setShowCreateNewPlayerModal(false);
              router.push('/');
            }}
          >
            Exit
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default NewPlayerModal;