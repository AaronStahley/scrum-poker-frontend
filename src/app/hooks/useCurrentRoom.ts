import React, { useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore';
import { Room } from '@/types/room';
import { db } from '@/lib/firebase/firebase';

export const ROOM_NOT_FOUND_ERROR = 'Room does not exist';

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
        setError(new Error(ROOM_NOT_FOUND_ERROR));
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
