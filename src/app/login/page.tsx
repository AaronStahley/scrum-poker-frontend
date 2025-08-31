"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseErrorMessages } from "@/lib/firebase/firebaseErrorMessages";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to login user";
      setError(errorMessage);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-5">Login</h1>
      {error && <p className="text-error">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-md" data-form="login">
        <input 
          type="email" 
          placeholder="Email" 
          className="input input-bordered w-full text-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={showForgotPasswordModal}
          tabIndex={showForgotPasswordModal ? -1 : 0}
        />

        <input 
          type="password" 
          placeholder="Password" 
          className="input input-bordered w-full text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={showForgotPasswordModal}
          tabIndex={showForgotPasswordModal ? -1 : 0}
        />

        <button 
          type="submit" 
          className="btn btn-primary w-full text-base"
          disabled={showForgotPasswordModal}
          tabIndex={showForgotPasswordModal ? -1 : 0}
        >
          Log In
        </button>
      </form>

      <div className="mt-4 text-center">
        <button 
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowForgotPasswordModal(true)}
        >
          Forgot Password?
        </button>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  )
}

export default LoginPage