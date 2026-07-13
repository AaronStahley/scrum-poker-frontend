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
          setLoading(false);
          return;
        }

        const playerIds: string[] = roomSnap.data().players || [];
        console.log('Updated Player IDs:', playerIds);

        if (playerIds.length === 0) {
          setPlayers([]);
          setLoading(false);
          return;
        }

        // Cleanup previous player listeners
        playerUnsubscribes.forEach((unsub) => unsub());
        playerUnsubscribes = [];

        // Use a Map to aggregate players from all chunks
        const playersMap = new Map<string, Player>();
        const chunks = chunkArray(playerIds, 10);
        let completedChunks = 0;

        for (const chunk of chunks) {
          const q = query(
            collection(db, 'players'),
            where('__name__', 'in', chunk),
            where('currentRoom', '==', roomId)
          );
          
          const unsubscribe = onSnapshot(q, (snapshot) => {
            // Update the map with players from this chunk
            snapshot.docs.forEach((doc) => {
              const playerData = {
                ...(doc.data() as Player),
                id: doc.id,
              };
              playersMap.set(doc.id, playerData);
            });

            // Remove any players not in this snapshot (they left/were removed)
            const currentChunkIds = new Set(snapshot.docs.map(doc => doc.id));
            for (const [playerId] of playersMap) {
              if (chunk.includes(playerId) && !currentChunkIds.has(playerId)) {
                playersMap.delete(playerId);
              }
            }

            // Convert map to array and update state
            const allPlayers = Array.from(playersMap.values());
            
            // Sort players by name for consistent ordering
            allPlayers.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
            
            setPlayers(allPlayers);
            console.log("Updated Players:", allPlayers);
            
            // Only set loading to false after first chunk loads
            completedChunks++;
            if (completedChunks === 1) {
              setLoading(false);
            }
          }, (error) => {
            console.error('Error fetching players chunk:', error);
            setError(error);
            setLoading(false);
          });

          playerUnsubscribes.push(unsubscribe);
        }
      }, (error) => {
        console.error('Error fetching room:', error);
        setError(error);
        setLoading(false);
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
