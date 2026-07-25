"use client";

import { useState } from "react";
import { Cog6ToothIcon, PencilIcon, UserGroupIcon, TrashIcon, Squares2X2Icon } from "@heroicons/react/20/solid";
import { PlayerRemovalPermission, CardSequenceType } from "@/types/room";
import DeleteRoomConfirmationModal from "./DeleteRoomConfirmationModal";
import CardSequenceRadioGroup from "./CardSequenceRadioGroup";

interface HostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomName: string;
  onUpdateRoomName: (newName: string) => Promise<void>;
  onDeleteRoom: () => Promise<void>;
  playerRemovalPermissions: PlayerRemovalPermission;
  onUpdatePermissions: (permissions: PlayerRemovalPermission) => Promise<void>;
  cardSequence: CardSequenceType;
  onUpdateCardSequence: (cardSequence: CardSequenceType) => Promise<void>;
}

const HostSettingsModal: React.FC<HostSettingsModalProps> = ({
  isOpen,
  onClose,
  currentRoomName,
  onUpdateRoomName,
  onDeleteRoom,
  playerRemovalPermissions,
  onUpdatePermissions,
  cardSequence,
  onUpdateCardSequence,
}) => {
  const [roomName, setRoomName] = useState(currentRoomName);
  const [permissions, setPermissions] = useState<PlayerRemovalPermission>(playerRemovalPermissions);
  const [sequence, setSequence] = useState<CardSequenceType>(cardSequence);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateRoomName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() === currentRoomName.trim()) {
      onClose();
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onUpdateRoomName(roomName.trim());
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    setError("");
    setIsDeleting(true);

    try {
      await onDeleteRoom();
      setShowDeleteConfirmation(false);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
      setIsDeleting(false);
    }
  };

  const handleUpdatePermissions = async (newPermissions: PlayerRemovalPermission) => {
    if (newPermissions === playerRemovalPermissions) return;

    setError("");
    setIsSubmitting(true);

    try {
      await onUpdatePermissions(newPermissions);
      setPermissions(newPermissions);
    } catch (err: unknown) {
      setError((err as Error).message);
      setPermissions(playerRemovalPermissions); // Reset on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCardSequence = async (newSequence: CardSequenceType) => {
    if (newSequence === cardSequence) return;

    setError("");
    setIsSubmitting(true);

    try {
      await onUpdateCardSequence(newSequence);
      setSequence(newSequence);
    } catch (err: unknown) {
      setError((err as Error).message);
      setSequence(cardSequence); // Reset on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isDeleting) return;
    setRoomName(currentRoomName);
    setPermissions(playerRemovalPermissions);
    setSequence(cardSequence);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
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
              disabled={isSubmitting || isDeleting}
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

          <div className="space-y-6">
            {/* Room Name Section */}
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-4">
                  <PencilIcon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-lg">Room Information</h4>
                </div>
                
                <form onSubmit={handleUpdateRoomName} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Room Name</span>
                      <span className="label-text-alt text-xs">2-25 characters</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter room name"
                      className="input input-bordered w-full focus:input-primary"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={25}
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button 
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setRoomName(currentRoomName)}
                      disabled={isSubmitting || roomName === currentRoomName}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || roomName.trim() === currentRoomName.trim()}
                    >
                      {isSubmitting && <span className="loading loading-spinner loading-sm" />}
                      {isSubmitting ? 'Updating...' : 'Update Name'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Player Permissions Section */}
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserGroupIcon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-lg">Player Permissions</h4>
                </div>
                
                <p className="text-sm text-base-content/70 mb-4 ml-8">Who can remove other players</p>
                  
                <div className="space-y-3">
                    <label className="cursor-pointer">
                      <div className="flex items-start justify-between p-4 border border-base-300 rounded-lg hover:bg-base-50 transition-colors">
                        <div className="flex flex-col items-start">
                          <span className="font-bold">Host Only</span>
                          <span className="text-sm text-base-content/70">Only the room host can remove other players</span>
                        </div>
                        <input 
                          type="radio" 
                          name="permissions" 
                          className="radio radio-primary mt-1" 
                          checked={permissions === 'host-only'}
                          onChange={() => handleUpdatePermissions('host-only')}
                          disabled={isSubmitting || isDeleting}
                        />
                      </div>
                    </label>
                    
                    <label className="cursor-pointer">
                      <div className="flex items-start justify-between p-4 border border-base-300 rounded-lg hover:bg-base-50 transition-colors">
                        <div className="flex flex-col items-start">
                          <span className="font-bold">All Players</span>
                          <span className="text-sm text-base-content/70">Any player can remove other players (except the host)</span>
                        </div>
                        <input 
                          type="radio" 
                          name="permissions" 
                          className="radio radio-primary mt-1" 
                          checked={permissions === 'all-players'}
                          onChange={() => handleUpdatePermissions('all-players')}
                          disabled={isSubmitting || isDeleting}
                        />
                      </div>
                    </label>
                </div>
              </div>
            </div>

            {/* Card Sequence Section */}
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Squares2X2Icon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-lg">Card Sequence</h4>
                </div>

                <p className="text-sm text-base-content/70 mb-4 ml-8">Which cards players can vote with</p>

                <CardSequenceRadioGroup
                  value={sequence}
                  onChange={handleUpdateCardSequence}
                  name="cardSequence"
                  disabled={isSubmitting || isDeleting}
                />
              </div>
            </div>

            {/* Danger Zone Section */}
            <div className="card bg-error/5 border border-error/20">
              <div className="card-body p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrashIcon className="h-5 w-5 text-error" />
                  <h4 className="font-semibold text-lg text-error">Danger Zone</h4>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-base-100 border border-error/30 rounded-lg">
                  <div>
                    <p className="text-sm text-base-content/70">Permanently delete this room and remove all players</p>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-error btn-outline"
                    onClick={() => setShowDeleteConfirmation(true)}
                    disabled={isSubmitting}
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete Room
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-action pt-6">
            <button 
              type="button"
              className="btn btn-outline btn-wide"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Close Settings
            </button>
          </div>
        </div>
      </div>
      
      <DeleteRoomConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirmDelete={handleDeleteRoom}
        roomName={currentRoomName}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default HostSettingsModal;