"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/auth";
import { firebaseErrorMessages } from "@/lib/firebase/firebaseErrorMessages";

const SignUpPage = () => {
  const { player, loading, upgradeAnonymousPlayer} = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (player && !player.isAnonymous) {
      router.push("/");
    }
  }, [player, router]);

  const handleConvertAnonymousUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await upgradeAnonymousPlayer(email, password);
      router.push("/"); 
    } catch (err: unknown) {
      setError((err as { code: string }).code);
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const newPlayerCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newPlayer = newPlayerCredential.user;

      await updateProfile(newPlayer, {
        displayName: displayName
      });

      router.push("/");
    } catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to create user";
      setError(errorMessage);    
    }
  };

  if(loading) {return <div className="flex-1 flex flex-col items-center justify-center h-screen">Loading...</div>;}

  // If the user is anonymous, provide ability to convert to a regular user
  if (player?.isAnonymous) {
    return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-5">Hello {player?.displayName ?? "Guest"}</h1>
      <p className="text-lg text-secondary mb-5">
        You are currently signed in as a guest. Please sign up to ensure your progress is saved.
      </p>
      {error && <p className="text-error">{error}</p>}
      <form onSubmit={handleConvertAnonymousUser} className="flex flex-col gap-4 w-full max-w-md">
        <input 
            type="email" 
            placeholder="Email" 
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required 
        />
        <input 
            type="password" 
            placeholder="Password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            autoComplete="current-password"
            required
        />
        <button type="submit" className="btn btn-primary w-full">Sign Up</button>
      </form>
    </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-5">Sign Up</h1>
      {error && <p className="text-error">{error}</p>}
      <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full max-w-md">
        <input 
            type="text" 
            placeholder="Display Name" 
            className="input input-bordered w-full"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={3}
            required 
        />
        <input 
            type="email" 
            placeholder="Email" 
            className="input input-bordered w-full"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required 
        />
        <input 
            type="password" 
            placeholder="Password"
            className="input input-bordered w-full"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            minLength={6}
            required
        />
        <button type="submit" className="btn btn-primary w-full">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;