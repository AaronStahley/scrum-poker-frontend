import { useEffect } from 'react';
import { initPresence } from '@/lib/firebase/presence';

export function usePresenceBeacon(playerId: string | undefined) {
  useEffect(() => {
    if (!playerId) return;
    return initPresence(playerId);
  }, [playerId]);
}
