"use client";

import { useState } from "react";
import { TrashIcon, ExclamationTriangleIcon, XCircleIcon } from "@heroicons/react/20/solid";

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
            <XCircleIcon className="h-8 w-8" />
            <span>{error}</span>
          </div>
        )}

        <div className="text-center mb-6">
          <div className="alert alert-warning mb-4">
            <ExclamationTriangleIcon className="h-8 w-8" />
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
            className="btn btn-outline min-w-32"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={`btn btn-error min-w-32 ${isDeleting ? 'loading' : ''}`}
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