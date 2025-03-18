"use client";

import { firebaseErrorMessages } from "@/lib/firebase/firebaseErrorMessages";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import useJoinRoom from "@/app/hooks/JoinRoom";
import { 
  User, 
  onAuthStateChanged, 
  EmailAuthProvider, 
  linkWithCredential,
  signInAnonymously,
  updateProfile
} from "firebase/auth";

interface AuthContextType {
  player: User | null;
  loading: boolean;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  setPlayer: (user: User | null) => void;
  upgradeAnonymousPlayer: (email: string, password: string) => Promise<void>;
  createNewAnonymousPlayer: (name: string) => Promise<void>;
  pendingRoomId: string;
  setPendingRoomId: (roomId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string>("");

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

  const createNewAnonymousPlayer = async (name: string) => {

    if (!name.trim()) return;

    try{ 
      setLoading(true);
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      await updateProfile(user!, { displayName: name });
      await auth.currentUser?.reload();
      setLoading(false);
      setShowModal(false);

      if (pendingRoomId) { 
        // joinRoom(pendingRoomId);
      }

    }catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to create new anonymous player";
      throw new Error(errorMessage);
    }
  }
  
  return (
    <AuthContext.Provider value={{ player, loading, showModal, setShowModal, setPlayer, upgradeAnonymousPlayer, createNewAnonymousPlayer, pendingRoomId, setPendingRoomId }}>
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
