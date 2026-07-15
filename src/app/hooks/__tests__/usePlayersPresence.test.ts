import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlayersPresence } from '../usePlayersPresence'
import * as presenceLib from '@/lib/firebase/presence'

vi.mock('@/lib/firebase/presence', () => ({
  subscribeToPresence: vi.fn(),
}))

const mockSubscribeToPresence = vi.mocked(presenceLib.subscribeToPresence)

describe('usePlayersPresence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('subscribes to presence for each given player id', () => {
    const unsubscribe = vi.fn()
    mockSubscribeToPresence.mockReturnValue(unsubscribe)

    renderHook(() => usePlayersPresence(['player-1', 'player-2']))

    expect(mockSubscribeToPresence).toHaveBeenCalledTimes(2)
    expect(mockSubscribeToPresence).toHaveBeenCalledWith('player-1', expect.any(Function))
    expect(mockSubscribeToPresence).toHaveBeenCalledWith('player-2', expect.any(Function))
  })

  it('reflects presence updates delivered via the subscription callback', () => {
    let capturedCallback: (online: boolean, lastChanged: Date | null) => void = () => {}
    mockSubscribeToPresence.mockImplementation((_id, cb) => {
      capturedCallback = cb
      return vi.fn()
    })

    const { result } = renderHook(() => usePlayersPresence(['player-1']))
    expect(result.current['player-1']).toBeUndefined()

    const lastChanged = new Date('2026-01-01T00:00:00Z')
    act(() => {
      capturedCallback(true, lastChanged)
    })

    expect(result.current['player-1']).toEqual({ online: true, lastChanged })
  })

  it('unsubscribes a player removed from the id list and subscribes newly added ones', () => {
    const unsubscribeA = vi.fn()
    const unsubscribeB = vi.fn()
    mockSubscribeToPresence.mockImplementation((id) =>
      id === 'player-a' ? unsubscribeA : unsubscribeB
    )

    const { rerender } = renderHook(
      ({ ids }) => usePlayersPresence(ids),
      { initialProps: { ids: ['player-a'] } }
    )
    expect(mockSubscribeToPresence).toHaveBeenCalledWith('player-a', expect.any(Function))

    rerender({ ids: ['player-b'] })

    expect(unsubscribeA).toHaveBeenCalled()
    expect(mockSubscribeToPresence).toHaveBeenCalledWith('player-b', expect.any(Function))
  })

  it('unsubscribes all players on unmount', () => {
    const unsubscribe = vi.fn()
    mockSubscribeToPresence.mockReturnValue(unsubscribe)

    const { unmount } = renderHook(() => usePlayersPresence(['player-1', 'player-2']))
    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(2)
  })
})
