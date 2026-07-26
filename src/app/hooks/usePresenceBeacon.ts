import { useEffect, useRef } from 'react';
import { initPresence, type PresenceHandle } from '@/lib/firebase/presence';
import { useIdleTimer } from '@/app/hooks/useIdleTimer';

export function usePresenceBeacon(playerId: string | undefined, idleTimeoutMs?: number) {
  const handleRef = useRef<PresenceHandle | null>(null);

  useEffect(() => {
    if (!playerId) return;
    const handle = initPresence(playerId);
    handleRef.current = handle;
    return () => {
      handleRef.current = null;
      handle.cleanup();
    };
  }, [playerId]);

  // Declared after the initPresence effect above so its cleanup (which
  // removes the activity listeners) runs before initPresence's cleanup
  // fires the deliberate offline write on unmount.
  useIdleTimer({
    enabled: !!playerId,
    idleTimeoutMs,
    onIdleChange: (isIdle) => handleRef.current?.setIdle(isIdle),
  });
}
