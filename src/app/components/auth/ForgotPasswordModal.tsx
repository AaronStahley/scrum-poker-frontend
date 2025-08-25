"use client";

import { useState } from "react";
import { useAuth } from "@/app/contexts/auth";
import { getFirebaseNoReplyEmail } from "@/lib/firebase/firebase";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
      setEmail("");
      
      // Auto close modal after 8 seconds of showing success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 8000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Reset Password</h3>
          <button 
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center">
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
              <span>Password reset email sent!</span>
            </div>
            <div className="text-sm text-base-content/70">
              <p>Check your inbox and spam folder.</p>
              <p className="text-xs mt-2">
                💡 <strong>Tip:</strong> Add {getFirebaseNoReplyEmail()} to your contacts to prevent emails going to spam.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-base-content/70 mb-4">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

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

            <form onSubmit={handleSubmit} className="space-y-4" data-form="password-reset">
              <div className="form-control">
                <input 
                  id="reset-email"
                  type="email" 
                  placeholder="Enter your email address"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                  data-form="password-reset-email"
                />
              </div>

              <div className="modal-action">
                <button 
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Email'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;