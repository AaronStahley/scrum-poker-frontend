"use client";

import { firebaseErrorMessages } from "@/lib/firebase/firebaseErrorMessages";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { 
  User, 
  onAuthStateChanged, 
  EmailAuthProvider, 
  linkWithCredential, 
} from "firebase/auth";

interface AuthContextType {
  player: User | null;
  loading: boolean;
  setPlayer: (user: User | null) => void;
  upgradeAnonymousPlayer: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser);
      setPlayer(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const upgradeAnonymousPlayer = async (email: string, password: string) => {
    if (!player) {
      console.error("Player is not authenticated.");
      return;
    }

    const credential = EmailAuthProvider.credential(email, password);
    
    try {
      setLoading(true);
      const linkedUser = await linkWithCredential(player, credential);
      console.log("User upgraded successfully:", linkedUser);
      await auth.currentUser?.reload();
    } catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to upgrade user";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ player, loading, setPlayer, upgradeAnonymousPlayer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
