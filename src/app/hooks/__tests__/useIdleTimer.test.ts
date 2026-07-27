import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIdleTimer } from '../useIdleTimer'

const IDLE_TIMEOUT_MS = 5 * 60_000
const POLL_INTERVAL_MS = 15_000

describe('useIdleTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reports idle only after the timeout elapses with no activity', () => {
    const onIdleChange = vi.fn()
    renderHook(() =>
      useIdleTimer({ onIdleChange, idleTimeoutMs: IDLE_TIMEOUT_MS, pollIntervalMs: POLL_INTERVAL_MS })
    )

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - POLL_INTERVAL_MS)
    })
    expect(onIdleChange).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(POLL_INTERVAL_MS * 2)
    })
    expect(onIdleChange).toHaveBeenCalledTimes(1)
    expect(onIdleChange).toHaveBeenCalledWith(true)
  })

  it('resets the idle clock when a mousemove/keydown occurs before the threshold', () => {
    const onIdleChange = vi.fn()
    renderHook(() =>
      useIdleTimer({ onIdleChange, idleTimeoutMs: IDLE_TIMEOUT_MS, pollIntervalMs: POLL_INTERVAL_MS })
    )

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - POLL_INTERVAL_MS)
      window.dispatchEvent(new Event('mousemove'))
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - POLL_INTERVAL_MS)
    })

    expect(onIdleChange).not.toHaveBeenCalled()
  })

  it('reports active immediately on a qualifying event following an idle period', () => {
    const onIdleChange = vi.fn()
    renderHook(() =>
      useIdleTimer({ onIdleChange, idleTimeoutMs: IDLE_TIMEOUT_MS, pollIntervalMs: POLL_INTERVAL_MS })
    )

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS + POLL_INTERVAL_MS)
    })
    expect(onIdleChange).toHaveBeenCalledTimes(1)
    expect(onIdleChange).toHaveBeenLastCalledWith(true)

    act(() => {
      window.dispatchEvent(new Event('keydown'))
    })

    expect(onIdleChange).toHaveBeenCalledTimes(2)
    expect(onIdleChange).toHaveBeenLastCalledWith(false)
  })

  it('does not report active again from further activity while already active', () => {
    const onIdleChange = vi.fn()
    renderHook(() =>
      useIdleTimer({ onIdleChange, idleTimeoutMs: IDLE_TIMEOUT_MS, pollIntervalMs: POLL_INTERVAL_MS })
    )

    act(() => {
      window.dispatchEvent(new Event('mousemove'))
      window.dispatchEvent(new Event('keydown'))
    })

    expect(onIdleChange).not.toHaveBeenCalled()
  })

  it('removes activity listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const onIdleChange = vi.fn()
    const { unmount } = renderHook(() =>
      useIdleTimer({ onIdleChange, idleTimeoutMs: IDLE_TIMEOUT_MS, pollIntervalMs: POLL_INTERVAL_MS })
    )

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })

  it('does not treat a visibilitychange event alone as activity', () => {
    const onIdleChange = vi.fn()
    renderHook(() =>
      useIdleTimer({ onIdleChange, idleTimeoutMs: IDLE_TIMEOUT_MS, pollIntervalMs: POLL_INTERVAL_MS })
    )

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - POLL_INTERVAL_MS)
      document.dispatchEvent(new Event('visibilitychange'))
      vi.advanceTimersByTime(POLL_INTERVAL_MS * 2)
    })

    expect(onIdleChange).toHaveBeenCalledWith(true)
  })
})
