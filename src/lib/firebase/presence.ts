import { ref, onValue, onDisconnect, set, serverTimestamp, type Unsubscribe } from "firebase/database";
import { rtdb } from "@/lib/firebase/firebase";

export interface PresenceHandle {
  // Reports an idle/active transition from inactivity detection. No-ops
  // unless the socket is currently connected, so an idle-driven write can
  // never race ahead of a legitimate disconnect-triggered offline write.
  setIdle: (isIdle: boolean) => void;
  // Unsubscribes and marks the player offline explicitly.
  cleanup: () => void;
}

// Registers this player as online, and arms an RTDB-side handler that flips
// them offline the instant their connection drops — including ungraceful
// disconnects (crash, network loss) that client-side code can never observe.
// cleanup() also marks them offline explicitly: the Firebase socket is
// shared across the whole tab and stays open through client-side navigation
// (e.g. leaving the room for the home page), so onDisconnect() alone would
// never fire for that case.
export function initPresence(playerId: string): PresenceHandle {
  const presenceRef = ref(rtdb, `presence/${playerId}`);
  const connectedRef = ref(rtdb, '.info/connected');

  let isConnected = false;
  let isIdle = false;

  const unsubscribe = onValue(connectedRef, (snap) => {
    if (snap.val() === false) {
      isConnected = false;
      return;
    }
    onDisconnect(presenceRef).set({ online: false, lastChanged: serverTimestamp() })
      .then(() => {
        isConnected = true;
        set(presenceRef, { online: !isIdle, lastChanged: serverTimestamp() });
      });
  });

  return {
    setIdle: (nextIsIdle: boolean) => {
      if (nextIsIdle === isIdle) return;
      isIdle = nextIsIdle;
      if (!isConnected) return;
      set(presenceRef, { online: !isIdle, lastChanged: serverTimestamp() });
    },
    cleanup: () => {
      unsubscribe();
      set(presenceRef, { online: false, lastChanged: serverTimestamp() });
    },
  };
}

export function subscribeToPresence(
  playerId: string,
  callback: (online: boolean, lastChanged: Date | null) => void
): Unsubscribe {
  const presenceRef = ref(rtdb, `presence/${playerId}`);
  return onValue(presenceRef, (snap) => {
    const data = snap.val();
    callback(!!data?.online, data?.lastChanged ? new Date(data.lastChanged) : null);
  });
}
