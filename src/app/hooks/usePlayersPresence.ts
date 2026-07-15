import { useEffect, useState } from 'react';
import { subscribeToPresence } from '@/lib/firebase/presence';

export type PresenceInfo = { online: boolean; lastChanged: Date | null };

export function usePlayersPresence(playerIds: string[]): Record<string, PresenceInfo> {
  const [presence, setPresence] = useState<Record<string, PresenceInfo>>({});
  const key = playerIds.join(',');

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    const unsubscribes = ids.map(id =>
      subscribeToPresence(id, (online, lastChanged) =>
        setPresence(prev => ({ ...prev, [id]: { online, lastChanged } }))
      )
    );
    return () => unsubscribes.forEach(unsub => unsub());
  }, [key]);

  return presence;
}
