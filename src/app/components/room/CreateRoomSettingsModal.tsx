"use client";

import { useState } from "react";
import { Cog6ToothIcon, Squares2X2Icon } from "@heroicons/react/20/solid";
import { CardSequenceType } from "@/types/room";
import CardSequenceRadioGroup from "./CardSequenceRadioGroup";

interface CreateRoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardSequence: CardSequenceType;
  onChangeCardSequence: (id: CardSequenceType) => void;
  onCreateRoom: () => Promise<void>;
}

const CreateRoomSettingsModal: React.FC<CreateRoomSettingsModalProps> = ({
  isOpen,
  onClose,
  cardSequence,
  onChangeCardSequence,
  onCreateRoom,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await onCreateRoom();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create room");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Cog6ToothIcon className="h-6 w-6 text-primary" />
            <h3 className="font-bold text-xl">Room Settings</h3>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-4">
              <Squares2X2Icon className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-lg">Card Sequence</h4>
            </div>

            <p className="text-sm text-base-content/70 mb-4 ml-8">Which cards players can vote with</p>

            <CardSequenceRadioGroup
              value={cardSequence}
              onChange={onChangeCardSequence}
              name="create-room-card-sequence"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="modal-action pt-6">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCreateRoom}
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="loading loading-spinner loading-sm" />}
            {isSubmitting ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomSettingsModal;
