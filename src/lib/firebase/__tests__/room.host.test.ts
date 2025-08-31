import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteRoom, updateRoomName } from '../room'
import * as firestore from 'firebase/firestore'

// Mock Firebase functions
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore')
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(),
    deleteDoc: vi.fn(),
    updateDoc: vi.fn(),
  }
})

const mockDoc = vi.mocked(firestore.doc)
const mockGetDoc = vi.mocked(firestore.getDoc)
const mockDeleteDoc = vi.mocked(firestore.deleteDoc)
const mockUpdateDoc = vi.mocked(firestore.updateDoc)

describe('Room Host Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('deleteRoom', () => {
    it('should delete room when user is the host', async () => {
      const roomId = 'test-room'
      const hostId = 'host-user'
      const roomData = { createdBy: hostId, name: 'Test Room' }

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => roomData
      } as firestore.DocumentSnapshot)
      mockDeleteDoc.mockResolvedValue(undefined)

      await deleteRoom(roomId, hostId)

      expect(mockGetDoc).toHaveBeenCalled()
      expect(mockDeleteDoc).toHaveBeenCalledWith('mock-ref')
    })

    it('should throw error when user is not the host', async () => {
      const roomId = 'test-room'
      const nonHostId = 'other-user'
      const hostId = 'host-user'
      const roomData = { createdBy: hostId, name: 'Test Room' }

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => roomData
      } as firestore.DocumentSnapshot)

      await expect(deleteRoom(roomId, nonHostId)).rejects.toThrow(
        'Only the room host can delete this room'
      )

      expect(mockDeleteDoc).not.toHaveBeenCalled()
    })

    it('should throw error when room does not exist', async () => {
      const roomId = 'nonexistent-room'
      const userId = 'any-user'

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => false
      } as firestore.DocumentSnapshot)

      await expect(deleteRoom(roomId, userId)).rejects.toThrow('Room not found')

      expect(mockDeleteDoc).not.toHaveBeenCalled()
    })
  })

  describe('updateRoomName', () => {
    it('should update room name when user is the host', async () => {
      const roomId = 'test-room'
      const hostId = 'host-user'
      const newName = 'Updated Room Name'
      const roomData = { createdBy: hostId, name: 'Old Room Name' }

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => roomData
      } as firestore.DocumentSnapshot)
      mockUpdateDoc.mockResolvedValue(undefined)

      await updateRoomName(roomId, newName, hostId)

      expect(mockGetDoc).toHaveBeenCalled()
      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-ref', { name: newName })
    })

    it('should throw error when user is not the host', async () => {
      const roomId = 'test-room'
      const nonHostId = 'other-user'
      const hostId = 'host-user'
      const newName = 'Updated Room Name'
      const roomData = { createdBy: hostId, name: 'Old Room Name' }

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => roomData
      } as firestore.DocumentSnapshot)

      await expect(updateRoomName(roomId, newName, nonHostId)).rejects.toThrow(
        'Only the room host can update this room'
      )

      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })

    it('should throw error when room does not exist', async () => {
      const roomId = 'nonexistent-room'
      const userId = 'any-user'
      const newName = 'Any Name'

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => false
      } as firestore.DocumentSnapshot)

      await expect(updateRoomName(roomId, newName, userId)).rejects.toThrow('Room not found')

      expect(mockUpdateDoc).not.toHaveBeenCalled()
    })

    it('should handle special characters and long names correctly', async () => {
      const roomId = 'test-room'
      const hostId = 'host-user'
      const specialName = 'Room with émojis 🚀 & symbols!'
      const roomData = { createdBy: hostId, name: 'Old Name' }

      mockDoc.mockReturnValue('mock-ref' as firestore.DocumentReference)
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => roomData
      } as firestore.DocumentSnapshot)
      mockUpdateDoc.mockResolvedValue(undefined)

      await updateRoomName(roomId, specialName, hostId)

      expect(mockUpdateDoc).toHaveBeenCalledWith('mock-ref', { name: specialName })
    })
  })
})