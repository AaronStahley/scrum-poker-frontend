"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { firebaseErrorMessages } from "@/lib/firebase/firebaseErrorMessages";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-md">
        <input 
          type="email" 
          placeholder="Email" 
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />

        <input 
          type="password" 
          placeholder="Password" 
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <button type="submit" className="btn btn-primary w-full">Log In</button>
      </form>
    </div>
  )
}

export default LoginPage