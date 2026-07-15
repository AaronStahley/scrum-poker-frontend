import { ref, onValue, onDisconnect, set, serverTimestamp, type Unsubscribe } from "firebase/database";
import { rtdb } from "@/lib/firebase/firebase";

// Registers this player as online, and arms an RTDB-side handler that flips
// them offline the instant their connection drops — including ungraceful
// disconnects (crash, network loss) that client-side code can never observe.
// The returned cleanup also marks them offline explicitly: the Firebase
// socket is shared across the whole tab and stays open through client-side
// navigation (e.g. leaving the room for the home page), so onDisconnect()
// alone would never fire for that case.
export function initPresence(playerId: string): Unsubscribe {
  const presenceRef = ref(rtdb, `presence/${playerId}`);
  const connectedRef = ref(rtdb, '.info/connected');

  const unsubscribe = onValue(connectedRef, (snap) => {
    if (snap.val() === false) return;
    onDisconnect(presenceRef).set({ online: false, lastChanged: serverTimestamp() })
      .then(() => set(presenceRef, { online: true, lastChanged: serverTimestamp() }));
  });

  return () => {
    unsubscribe();
    set(presenceRef, { online: false, lastChanged: serverTimestamp() });
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
