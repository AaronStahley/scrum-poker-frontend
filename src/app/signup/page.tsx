"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);

    if (auth.currentUser) {
      router.push("/");
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect after signup
    } catch (err: any) {
      setError(err.message);
    }
  };

  if(isLoading) {return <div className="flex-1 flex flex-col items-center justify-center h-screen">Loading...</div>;}

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Sign Up</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full max-w-md">
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
            minLength={6}
            required
        />
        <button type="submit" className="btn btn-primary w-full">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpPage;