import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePlayersInRoom } from '../usePlayersInRoom'
import * as firestore from 'firebase/firestore'

// Mock Firebase functions
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    doc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
  }
})

// const mockDoc = vi.mocked(firestore.doc)
// const mockCollection = vi.mocked(firestore.collection)
// const mockQuery = vi.mocked(firestore.query)
// const mockWhere = vi.mocked(firestore.where)
const mockOnSnapshot = vi.mocked(firestore.onSnapshot)

describe('usePlayersInRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should aggregate players from multiple chunks correctly', async () => {
    const roomId = 'test-room'
    let roomCallback: (snapshot: firestore.DocumentSnapshot) => void
    const playerCallbacks: Array<(snapshot: firestore.QuerySnapshot) => void> = []

    // Mock room snapshot listener
    mockOnSnapshot.mockImplementation((ref, callback) => {
      if (typeof callback === 'function') {
        if (playerCallbacks.length === 0) {
          // This is the room listener
          roomCallback = callback as (snapshot: firestore.DocumentSnapshot) => void
        } else {
          // These are player listeners
          playerCallbacks.push(callback as (snapshot: firestore.QuerySnapshot) => void)
        }
      }
      return vi.fn() // unsubscribe function
    })

    const { result } = renderHook(() => usePlayersInRoom(roomId))

    // Simulate room data with 25 players (3 chunks of 10, 10, 5)
    const playerIds = Array.from({ length: 25 }, (_, i) => `player${i + 1}`)
    
    // Trigger room snapshot
    roomCallback!({
      exists: () => true,
      data: () => ({ players: playerIds })
    })

    // Wait for player listeners to be set up
    await waitFor(() => {
      expect(playerCallbacks.length).toBe(3) // 3 chunks
    })

    // Simulate player data from each chunk
    const chunk1Players = Array.from({ length: 10 }, (_, i) => ({
      id: `player${i + 1}`,
      data: () => ({ name: `Player ${i + 1}`, selection: null })
    }))

    const chunk2Players = Array.from({ length: 10 }, (_, i) => ({
      id: `player${i + 11}`,
      data: () => ({ name: `Player ${i + 11}`, selection: null })
    }))

    const chunk3Players = Array.from({ length: 5 }, (_, i) => ({
      id: `player${i + 21}`,
      data: () => ({ name: `Player ${i + 21}`, selection: null })
    }))

    // Trigger each chunk callback
    playerCallbacks[0]({ docs: chunk1Players })
    playerCallbacks[1]({ docs: chunk2Players })
    playerCallbacks[2]({ docs: chunk3Players })

    await waitFor(() => {
      expect(result.current.players).toHaveLength(25)
      expect(result.current.loading).toBe(false)
    })

    // Verify all players are present and sorted
    expect(result.current.players[0].name).toBe('Player 1')
    expect(result.current.players[24].name).toBe('Player 9') // Sorted alphabetically
  })

  it('should handle player removal from chunks correctly', async () => {
    const roomId = 'test-room'
    let roomCallback: (snapshot: firestore.DocumentSnapshot) => void
    const playerCallbacks: Array<(snapshot: firestore.QuerySnapshot) => void> = []

    mockOnSnapshot.mockImplementation((ref, callback) => {
      if (playerCallbacks.length === 0) {
        roomCallback = callback as (snapshot: firestore.DocumentSnapshot) => void
      } else {
        playerCallbacks.push(callback as (snapshot: firestore.QuerySnapshot) => void)
      }
      return vi.fn()
    })

    const { result } = renderHook(() => usePlayersInRoom(roomId))

    // Initial room with 3 players
    const playerIds = ['player1', 'player2', 'player3']
    roomCallback!({
      exists: () => true,
      data: () => ({ players: playerIds })
    })

    await waitFor(() => {
      expect(playerCallbacks.length).toBe(1)
    })

    // Initial player data
    const initialPlayers = [
      { id: 'player1', data: () => ({ name: 'Player 1' }) },
      { id: 'player2', data: () => ({ name: 'Player 2' }) },
      { id: 'player3', data: () => ({ name: 'Player 3' }) },
    ]

    playerCallbacks[0]({ docs: initialPlayers })

    await waitFor(() => {
      expect(result.current.players).toHaveLength(3)
    })

    // Player 2 leaves - simulate updated snapshot
    const updatedPlayers = [
      { id: 'player1', data: () => ({ name: 'Player 1' }) },
      { id: 'player3', data: () => ({ name: 'Player 3' }) },
    ]

    playerCallbacks[0]({ docs: updatedPlayers })

    await waitFor(() => {
      expect(result.current.players).toHaveLength(2)
      expect(result.current.players.find(p => p.id === 'player2')).toBeUndefined()
    })
  })

  it('should handle room not existing', async () => {
    const roomId = 'nonexistent-room'
    let roomCallback: (snapshot: any) => void

    mockOnSnapshot.mockImplementation((ref, callback) => {
      roomCallback = callback
      return vi.fn()
    })

    const { result } = renderHook(() => usePlayersInRoom(roomId))

    roomCallback!({
      exists: () => false
    })

    await waitFor(() => {
      expect(result.current.error?.message).toBe('Room does not exist')
      expect(result.current.players).toHaveLength(0)
      expect(result.current.loading).toBe(false)
    })
  })

  it('should handle Firebase errors gracefully', async () => {
    const roomId = 'test-room'
    let errorCallback: (error: Error) => void

    mockOnSnapshot.mockImplementation((ref, callback, onError) => {
      if (onError) {
        errorCallback = onError
      }
      return vi.fn()
    })

    const { result } = renderHook(() => usePlayersInRoom(roomId))

    const testError = new Error('Firebase connection failed')
    errorCallback!(testError)

    await waitFor(() => {
      expect(result.current.error).toBe(testError)
      expect(result.current.loading).toBe(false)
    })
  })
})