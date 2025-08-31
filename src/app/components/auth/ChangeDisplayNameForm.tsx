"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/auth";
import { DISPLAY_NAME_MAX_LENGTH } from "@/constants/validation";

interface ChangeDisplayNameFormProps {
  onSuccess?: () => void;
}

const ChangeDisplayNameForm: React.FC<ChangeDisplayNameFormProps> = ({ onSuccess }) => {
  const [newDisplayName, setNewDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { player, updateDisplayName } = useAuth();
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!newDisplayName.trim()) {
      setError("Display name cannot be empty");
      return;
    }

    if (newDisplayName.trim().length > DISPLAY_NAME_MAX_LENGTH) {
      setError(`Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or less`);
      return;
    }

    if (newDisplayName.trim() === player?.displayName) {
      setError("New display name must be different from current display name");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateDisplayName(newDisplayName.trim());
      setSuccess(true);
      setNewDisplayName("");
      
      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 5 seconds
      successTimeoutRef.current = setTimeout(() => {
        setSuccess(false);
        successTimeoutRef.current = null;
      }, 5000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h3 className="card-title text-xl mb-4">Change Display Name</h3>
        
        <div className="mb-4">
          <label className="label" htmlFor="current-display-name">
            <span className="label-text font-medium">Current Display Name</span>
          </label>
          <input
            id="current-display-name"
            type="text"
            value={player?.displayName || ""}
            className="input input-bordered w-full bg-base-200"
            disabled
            readOnly
          />
        </div>
        
        {success && (
          <div className="alert alert-success mb-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Display name updated successfully!</span>
          </div>
        )}

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="new-display-name">
              <span className="label-text">New Display Name</span>
            </label>
            <input
              id="new-display-name"
              type="text"
              placeholder={`Enter new display name (max ${DISPLAY_NAME_MAX_LENGTH} characters)`}
              className="input input-bordered w-full"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              required
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              disabled={isSubmitting}
              autoComplete="name"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">
                {newDisplayName.length}/{DISPLAY_NAME_MAX_LENGTH} characters
              </span>
            </label>
          </div>

          <div className="form-control pt-4">
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Display Name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeDisplayNameForm;