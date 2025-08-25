"use client";

import { firebaseErrorMessages } from "@/lib/firebase/firebaseErrorMessages";
import { updatePlayerDisplayName, playerExists } from "@/lib/firebase/player";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { 
  User, 
  onAuthStateChanged, 
  EmailAuthProvider, 
  linkWithCredential,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential
} from "firebase/auth";

interface AuthContextType {
  player: User | null;
  loading: boolean;
  showCreateNewPlayerModal: boolean;
  setShowCreateNewPlayerModal: (show: boolean) => void;
  setPlayer: (user: User | null) => void;
  upgradeAnonymousPlayer: (email: string, password: string) => Promise<void>;
  createNewAnonymousPlayer: (name: string) => Promise<void>;
  setPlayerCreated: (created: boolean) => void;
  playerCreated: boolean;
  pendingRoomId: string | null;
  setPendingRoomId: (roomId: string | null) => void;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateDisplayName: (newDisplayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateNewPlayerModal, setShowCreateNewPlayerModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [playerCreated, setPlayerCreated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
      setPlayerCreated(true)
      setLoading(false);
      setShowCreateNewPlayerModal(false);
    }catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to create new anonymous player";
      throw new Error(errorMessage);
    }
  }

  const sendPasswordResetEmailToUser = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to send password reset email";
      throw new Error(errorMessage);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!player) {
      throw new Error("No user is currently logged in");
    }

    try {
      // Re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(player.email!, currentPassword);
      await reauthenticateWithCredential(player, credential);
      
      // Update to the new password
      await updatePassword(player, newPassword);
      
    } catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to update password";
      throw new Error(errorMessage);
    }
  };

  const updateDisplayName = async (newDisplayName: string) => {
    if (!player) {
      throw new Error("No user is currently logged in");
    }

    if (!newDisplayName.trim()) {
      throw new Error("Display name cannot be empty");
    }

    try {
      // Update the user's display name in Firebase Auth
      await updateProfile(player, { displayName: newDisplayName.trim() });
      
      // Reload the user to get the updated profile
      await auth.currentUser?.reload();
      
      // Also update the Firestore player record if it exists
      const playerExistsInDb = await playerExists(player.uid);
      if (playerExistsInDb) {
        await updatePlayerDisplayName(player.uid, newDisplayName.trim());
      }
      
    } catch (err: unknown) {
      const errorMessage = firebaseErrorMessages[(err as { code: string }).code] || "Failed to update display name";
      throw new Error(errorMessage);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      player, 
      loading, 
      showCreateNewPlayerModal,
      setShowCreateNewPlayerModal,
      setPlayer, 
      upgradeAnonymousPlayer, 
      createNewAnonymousPlayer, 
      setPlayerCreated, 
      playerCreated, 
      pendingRoomId, 
      setPendingRoomId,
      sendPasswordResetEmail: sendPasswordResetEmailToUser,
      updateUserPassword,
      updateDisplayName
    }}>
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
