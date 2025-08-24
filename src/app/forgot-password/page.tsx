"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/auth";
import { getFirebaseNoReplyEmail } from "@/lib/firebase/firebase";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendPasswordResetEmail } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(email);
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="alert alert-success max-w-md">
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
          <span>Password reset email sent! Check your inbox and spam folder.</span>
        </div>
        <div className="text-sm text-base-content/70 mt-4 max-w-md">
          <p className="mb-2">Redirecting to login page...</p>
          <p className="text-xs">
            💡 <strong>Tip:</strong> If you don&apos;t see the email, check your spam/junk folder. 
            Add {getFirebaseNoReplyEmail()} to your contacts to prevent this in future.
          </p>
        </div>
        <Link href="/login" className="btn btn-ghost btn-sm mt-2">
          Go to Login Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-5">Reset Password</h1>
      <p className="text-lg text-base-content/70 mb-6 max-w-md">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>
      
      {error && (
        <div className="alert alert-error max-w-md mb-4">
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input 
          type="email" 
          placeholder="Email" 
          className="input input-bordered w-full text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isSubmitting}
        />

        <button 
          type="submit" 
          className={`btn btn-primary w-full text-base ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="btn btn-ghost btn-sm">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;