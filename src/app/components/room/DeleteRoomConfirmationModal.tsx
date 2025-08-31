"use client";

import { useState } from "react";
import { TrashIcon } from "@heroicons/react/20/solid";

interface DeleteRoomConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  roomName: string;
  isDeleting: boolean;
}

const DeleteRoomConfirmationModal: React.FC<DeleteRoomConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  roomName,
  isDeleting
}) => {
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    try {
      await onConfirmDelete();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-error">Delete Room</h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
            disabled={isDeleting}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
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

        <div className="text-center mb-6">
          <div className="alert alert-warning mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 shrink-0 stroke-current mx-auto"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-lg">This action cannot be undone!</h4>
              <p className="text-sm mt-1">All room data will be permanently deleted.</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-base-content/80 mb-2">
              Are you sure you want to delete the room:
            </p>
            <p className="font-bold text-lg text-primary">&ldquo;{roomName}&rdquo;</p>
          </div>

          <p className="text-sm text-base-content/70">
            All players will be removed and the room data will be permanently deleted.
          </p>
        </div>

        <div className="modal-action justify-center gap-3">
          <button 
            type="button"
            className="btn btn-outline btn-wide"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={`btn btn-error btn-wide ${isDeleting ? 'loading' : ''}`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <TrashIcon className="h-5 w-5" />
            {isDeleting ? 'Deleting...' : 'Delete Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoomConfirmationModal;