import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { User, onAuthStateChanged } from "firebase/auth";

const getPlayer = () => {
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setPlayer(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { player, loading };
};

export default getPlayer;