import React, { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore';
import { Room } from '@/types/room';
import { db } from '@/lib/firebase/firebase';

export function useCurrentRoom(roomId: string) {
  const [room, setRoom] = React.useState<Room>({} as Room);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
    if (snapshot.exists()) {
        setRoom(snapshot.data() as Room);
        setLoading(false);
    } else {
        setError(new Error('Room does not exist'));
        setLoading(false);
    }
    }, (error) => {
    setError(error);
    setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  return { room, loading, error };
}
