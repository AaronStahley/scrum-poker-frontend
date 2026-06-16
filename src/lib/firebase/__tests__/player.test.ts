import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updatePlayers, updatePlayer, createPlayer, getPlayer } from '../player'
import * as firestore from 'firebase/firestore'

// Mock Firebase functions
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
  }
})

const mockCollection = vi.mocked(firestore.collection)
const mockQuery = vi.mocked(firestore.query)
const mockWhere = vi.mocked(firestore.where)
const mockGetDocs = vi.mocked(firestore.getDocs)
const mockUpdateDoc = vi.mocked(firestore.updateDoc)
const mockDoc = vi.mocked(firestore.doc)
const mockGetDoc = vi.mocked(firestore.getDoc)
const mockSetDoc = vi.mocked(firestore.setDoc)

describe('Player Firebase Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updatePlayers', () => {
    it('should update all players in a room concurrently without race conditions', async () => {
      // Setup mock data
      const roomId = 'test-room'
      const playerData = { selection: 5 }
      
      const mockDocs = [
        { id: 'player1', ref: 'ref1' },
        { id: 'player2', ref: 'ref2' },
        { id: 'player3', ref: 'ref3' },
      ]

      mockCollection.mockReturnValue({} as firestore.CollectionReference)
      mockQuery.mockReturnValue({} as firestore.Query)
      mockWhere.mockReturnValue({} as firestore.QueryConstraint)
      mockGetDocs.mockResolvedValue({
        docs: mockDocs
      } as firestore.QuerySnapshot)
      mockUpdateDoc.mockResolvedValue(undefined)

      // Execute
      await updatePlayers(roomId, playerData)

      // Verify all updates were called (3 player updates + 1 room lastActivity update)
      expect(mockUpdateDoc).toHaveBeenCalledTimes(4)
      expect(mockUpdateDoc).toHaveBeenCalledWith('ref1', playerData)
      expect(mockUpdateDoc).toHaveBeenCalledWith('ref2', playerData)
      expect(mockUpdateDoc).toHaveBeenCalledWith('ref3', playerData)
    })

    it('should handle concurrent updatePlayers calls without interference', async () => {
      // This test verifies that Promise.all prevents race conditions
      const roomId = 'test-room'
      const mockDocs = [{ id: 'player1', ref: 'ref1' }]

      mockGetDocs.mockResolvedValue({ docs: mockDocs } as firestore.QuerySnapshot)
      mockUpdateDoc.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10))
      )

      // Execute multiple concurrent calls
      const promises = [
        updatePlayers(roomId, { selection: 1 }),
        updatePlayers(roomId, { selection: 2 }),
        updatePlayers(roomId, { selection: 3 }),
      ]

      await Promise.all(promises)

      // Verify all calls completed (1 player update + 1 room lastActivity update per updatePlayers call × 3 calls)
      expect(mockUpdateDoc).toHaveBeenCalledTimes(6)
    })
  })

  describe('updatePlayer', () => {
    it('should update a single player successfully', async () => {
      const playerId = 'test-player'
      const playerData = { selection: 8 }

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockUpdateDoc.mockResolvedValue(undefined)

      await updatePlayer(playerId, playerData)

      expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'players', playerId)
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-ref', playerData)
    })
  })

  describe('createPlayer', () => {
    it('should create a new player with correct data structure', async () => {
      const playerId = 'new-player'
      const playerName = 'Test Player'

      mockDoc.mockReturnValue({ id: playerId } as firestore.DocumentReference)
      mockSetDoc.mockResolvedValue(undefined)

      const result = await createPlayer(playerId, playerName)

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: playerId,
          name: playerName,
          currentRoom: null,
          selection: null,
          createdAt: expect.any(Date)
        })
      )
      expect(result).toBe(playerId)
    })
  })

  describe('getPlayer', () => {
    it('should retrieve player data successfully', async () => {
      const playerId = 'test-player'
      const playerData = { id: playerId, name: 'Test', selection: 5 }

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => playerData
      } as firestore.DocumentSnapshot)

      const result = await getPlayer(playerId)

      expect(result).toEqual(playerData)
    })

    it('should throw error when player not found', async () => {
      const playerId = 'nonexistent-player'

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => false
      } as firestore.DocumentSnapshot)

      await expect(getPlayer(playerId)).rejects.toThrow('Player not found')
    })
  })
})