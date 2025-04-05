import { useEffect, useState } from 'react';
import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Player } from '@/types/player';

function chunkArray(array: string[], size: number) {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

export function usePlayersInRoom(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    let roomUnsubscribe: Unsubscribe | null = null;
    let playerUnsubscribes: Unsubscribe[] = [];

    const listenToRoom = () => {
      const roomRef = doc(db, 'rooms', roomId);

      roomUnsubscribe = onSnapshot(roomRef, (roomSnap) => {
        if (!roomSnap.exists()) {
          setError(new Error('Room does not exist'));
          setPlayers([]);
          return;
        }

        const playerIds: string[] = roomSnap.data().players || [];
        console.log('Updated Player IDs:', playerIds);

        if (playerIds.length === 0) {
          setPlayers([]);
          return;
        }

        // Cleanup previous player listeners
        playerUnsubscribes.forEach((unsub) => unsub());
        playerUnsubscribes = [];

        const chunks = chunkArray(playerIds, 10);

        for (const chunk of chunks) {
            const q = query(
            collection(db, 'players'),
            where('__name__', 'in', chunk),
            where('currentRoom', '==', roomId)
            );
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const updatedPlayers = snapshot.docs.map((doc) => ({
              ...(doc.data() as Player),
              id: doc.id,
            }));
          
            setPlayers(updatedPlayers);
          
            console.log("Updated Players:", updatedPlayers);
            setLoading(false);
          });

          playerUnsubscribes.push(unsubscribe);
        }
      });
    };

    listenToRoom();

    return () => {
      if (roomUnsubscribe) roomUnsubscribe();
      playerUnsubscribes.forEach((unsub) => unsub());
    };
  }, [roomId]);

  return { players, loading, error };
}
