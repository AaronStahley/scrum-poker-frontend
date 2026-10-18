import { useEffect, useState } from 'react';
import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { toDate } from '@/lib/firebase/timestamps';
import { Player } from '@/types/player';

// Player docs are only readable by room members (firestore.rules), so the query
// filters on currentRoom and starts only once currentUserId is in the room.
// Membership counts only once the server has confirmed it: our own join shows up
// locally first, and querying before it's saved gets the listener rejected.
// `removed` turns true when currentUserId was a member and no longer is.
export function usePlayersInRoom(roomId: string, currentUserId?: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    setRemoved(false);
    let wasMember = false;
    let playersUnsubscribe: Unsubscribe | null = null;
    let roomPlayerIds = new Set<string>();
    let playerDocs: QueryDocumentSnapshot<DocumentData>[] = [];

    // Players in the room's list whose own doc also points at this room
    const publishPlayers = () => {
      const roomPlayers = playerDocs
        .filter((playerDoc) => roomPlayerIds.has(playerDoc.id))
        .map((playerDoc): Player => {
          const data = playerDoc.data();
          return {
            ...(data as Player),
            id: playerDoc.id,
            lastJoinedAt: toDate(data.lastJoinedAt),
            createdAt: toDate(data.createdAt),
          };
        });

      // Sort players by name for consistent ordering
      roomPlayers.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      setPlayers(roomPlayers);
    };

    const stopPlayersListener = () => {
      if (playersUnsubscribe) playersUnsubscribe();
      playersUnsubscribe = null;
      playerDocs = [];
    };

    const startPlayersListener = () => {
      const q = query(collection(db, 'players'), where('currentRoom', '==', roomId));
      playersUnsubscribe = onSnapshot(q, (snapshot) => {
        setError(null);
        playerDocs = snapshot.docs;
        publishPlayers();
        setLoading(false);
      }, (error) => {
        console.error('Error fetching players:', error);
        setError(error);
        setLoading(false);
      });
    };

    const roomUnsubscribe = onSnapshot(doc(db, 'rooms', roomId), { includeMetadataChanges: true }, (roomSnap) => {
      if (roomSnap.metadata.hasPendingWrites) return;

      if (!roomSnap.exists()) {
        stopPlayersListener();
        setError(new Error('Room does not exist'));
        setPlayers([]);
        setLoading(false);
        return;
      }

      roomPlayerIds = new Set<string>(roomSnap.data().players || []);
      const isMember = !!currentUserId && roomPlayerIds.has(currentUserId);

      if (!isMember) {
        if (wasMember) setRemoved(true);
        stopPlayersListener();
        setPlayers([]);
        setLoading(false);
        return;
      }

      wasMember = true;
      if (playersUnsubscribe) {
        // Already listening; the room's player list may have changed
        publishPlayers();
      } else {
        startPlayersListener();
      }
    }, (error) => {
      console.error('Error fetching room:', error);
      setError(error);
      setLoading(false);
    });

    return () => {
      roomUnsubscribe();
      stopPlayersListener();
    };
  }, [roomId, currentUserId]);

  return { players, loading, error, removed };
}
