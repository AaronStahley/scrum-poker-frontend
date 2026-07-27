import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;

export interface UseIdleTimerOptions {
  onIdleChange: (isIdle: boolean) => void;
  idleTimeoutMs?: number;
  pollIntervalMs?: number;
  enabled?: boolean;
}

const DEFAULT_IDLE_TIMEOUT_MS = 5 * 60_000;
const DEFAULT_POLL_INTERVAL_MS = 15_000;

// Tracks real user input (mouse/keyboard/touch/scroll) and reports idle/active
// transitions after a period of no activity. Deliberately does not listen for
// visibilitychange/blur/focus — switching tabs should not by itself count as
// going idle, only the absence of actual input.
export function useIdleTimer({
  onIdleChange,
  idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  enabled = true,
}: UseIdleTimerOptions): void {
  const lastActivityRef = useRef<number>(Date.now());
  const wasIdleRef = useRef<boolean>(false);
  const onIdleChangeRef = useRef(onIdleChange);
  onIdleChangeRef.current = onIdleChange;

  useEffect(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    wasIdleRef.current = false;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (wasIdleRef.current) {
        wasIdleRef.current = false;
        onIdleChangeRef.current(false);
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }

    const interval = setInterval(() => {
      const isIdle = Date.now() - lastActivityRef.current >= idleTimeoutMs;
      if (isIdle !== wasIdleRef.current) {
        wasIdleRef.current = isIdle;
        onIdleChangeRef.current(isIdle);
      }
    }, pollIntervalMs);

    return () => {
      clearInterval(interval);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
    };
  }, [enabled, idleTimeoutMs, pollIntervalMs]);
}
