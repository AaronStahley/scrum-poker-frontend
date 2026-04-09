"use client";

import { useState } from "react";
import Link from "next/link";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

const ForgotPasswordPage = () => {
  const [showModal, setShowModal] = useState(true);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold mb-5">Reset Password</h1>
        <p className="text-lg text-base-content/70 mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
        
        <button 
          className="btn btn-primary w-full mb-4"
          onClick={() => setShowModal(true)}
        >
          Reset Password
        </button>

        <div className="text-center">
          <Link href="/login" className="btn btn-ghost btn-sm">
            ← Back to Login
          </Link>
        </div>
      </div>

      <ForgotPasswordModal 
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ForgotPasswordPage;