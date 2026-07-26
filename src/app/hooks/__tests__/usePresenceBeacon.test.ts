import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePresenceBeacon } from '../usePresenceBeacon'
import * as presenceLib from '@/lib/firebase/presence'

vi.mock('@/lib/firebase/presence', () => ({
  initPresence: vi.fn(),
}))

const mockInitPresence = vi.mocked(presenceLib.initPresence)

// usePresenceBeacon doesn't expose pollIntervalMs, so tests run against
// useIdleTimer's actual default poll interval (15s). Fake timers make the
// wall-clock size of these values irrelevant to test speed.
const IDLE_TIMEOUT_MS = 60_000
const DEFAULT_POLL_INTERVAL_MS = 15_000

describe('usePresenceBeacon', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does nothing when there is no playerId', () => {
    renderHook(() => usePresenceBeacon(undefined, IDLE_TIMEOUT_MS))
    expect(mockInitPresence).not.toHaveBeenCalled()
  })

  it('initializes presence for the given playerId', () => {
    const setIdle = vi.fn()
    const cleanup = vi.fn()
    mockInitPresence.mockReturnValue({ setIdle, cleanup })

    renderHook(() => usePresenceBeacon('player-1', IDLE_TIMEOUT_MS))

    expect(mockInitPresence).toHaveBeenCalledWith('player-1')
  })

  it('calls setIdle(true) after the inactivity timeout elapses', () => {
    const setIdle = vi.fn()
    const cleanup = vi.fn()
    mockInitPresence.mockReturnValue({ setIdle, cleanup })

    renderHook(() => usePresenceBeacon('player-1', IDLE_TIMEOUT_MS))

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS + DEFAULT_POLL_INTERVAL_MS)
    })

    expect(setIdle).toHaveBeenCalledWith(true)
  })

  it('calls setIdle(false) once activity resumes after going idle', () => {
    const setIdle = vi.fn()
    const cleanup = vi.fn()
    mockInitPresence.mockReturnValue({ setIdle, cleanup })

    renderHook(() => usePresenceBeacon('player-1', IDLE_TIMEOUT_MS))

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS + DEFAULT_POLL_INTERVAL_MS)
    })
    expect(setIdle).toHaveBeenLastCalledWith(true)

    act(() => {
      window.dispatchEvent(new Event('mousemove'))
      vi.advanceTimersByTime(DEFAULT_POLL_INTERVAL_MS)
    })

    expect(setIdle).toHaveBeenLastCalledWith(false)
  })

  it('calls cleanup on unmount', () => {
    const setIdle = vi.fn()
    const cleanup = vi.fn()
    mockInitPresence.mockReturnValue({ setIdle, cleanup })

    const { unmount } = renderHook(() => usePresenceBeacon('player-1', IDLE_TIMEOUT_MS))
    unmount()

    expect(cleanup).toHaveBeenCalled()
  })
})
