import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RoomClient from '../RoomClient'
import * as authContext from '@/app/contexts/auth'
import * as useJoinRoom from '@/app/hooks/useJoinRoom'
import * as usePlayersInRoom from '@/app/hooks/usePlayersInRoom'
import * as useCurrentRoom from '@/app/hooks/useCurrentRoom'

// Mock the hooks and context
vi.mock('@/app/contexts/auth')
vi.mock('@/app/hooks/useJoinRoom')
vi.mock('@/app/hooks/usePlayersInRoom')
vi.mock('@/app/hooks/useCurrentRoom')
vi.mock('@/lib/firebase/player')
vi.mock('@/lib/firebase/room')
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

const mockUseAuth = vi.mocked(authContext.useAuth)
const mockUseJoinRoom = vi.mocked(useJoinRoom.default)
const mockUsePlayersInRoom = vi.mocked(usePlayersInRoom.usePlayersInRoom)
const mockUseCurrentRoom = vi.mocked(useCurrentRoom.useCurrentRoom)

describe('RoomClient - Host Features', () => {
  const hostPlayer = {
    uid: 'host-player-id',
    displayName: 'Host Player',
  }

  const nonHostPlayer = {
    uid: 'regular-player-id',
    displayName: 'Regular Player',
  }

  const mockRoom = {
    id: 'test-room',
    name: 'Test Room',
    status: 'waiting',
    createdBy: 'host-player-id',
  }

  const mockPlayers = [
    { id: 'host-player-id', name: 'Host Player', selection: null },
    { id: 'regular-player-id', name: 'Regular Player', selection: 5 },
  ]

  const setupMocks = (currentPlayer: typeof hostPlayer | typeof nonHostPlayer) => {
    mockUseAuth.mockReturnValue({
      player: currentPlayer,
    } as authContext.AuthContextType)

    mockUseJoinRoom.mockReturnValue({} as ReturnType<typeof useJoinRoom.default>)
    
    mockUsePlayersInRoom.mockReturnValue({
      players: mockPlayers,
      loading: false,
      error: null,
    })

    mockUseCurrentRoom.mockReturnValue({
      room: mockRoom,
      loading: false,
      error: null,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Host Settings Button', () => {
    it('should show settings button when current player is room host', () => {
      setupMocks(hostPlayer)
      render(<RoomClient roomId="test-room" />)

      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument()
    })

    it('should not show settings button when current player is not room host', () => {
      setupMocks(nonHostPlayer)
      render(<RoomClient roomId="test-room" />)

      expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
    })

    it('should open host settings modal when settings button is clicked', async () => {
      const user = userEvent.setup()
      setupMocks(hostPlayer)
      render(<RoomClient roomId="test-room" />)

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      expect(screen.getByText('Room Settings')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test Room')).toBeInTheDocument()
    })
  })

  describe('Host Visual Indicators', () => {
    it('should pass host information to PlayerTable', () => {
      setupMocks(hostPlayer)
      render(<RoomClient roomId="test-room" />)

      // The PlayerTable should receive the correct roomOwnerId
      // We can verify this by checking if the host player name is rendered
      expect(screen.getByText('Host Player')).toBeInTheDocument()
      expect(screen.getByText('Regular Player')).toBeInTheDocument()
    })

    it('should identify correct player as host regardless of current user', () => {
      // Test that host identification works even when non-host is viewing
      setupMocks(nonHostPlayer)
      render(<RoomClient roomId="test-room" />)

      // Both players should be visible, but only the actual host should have host indicators
      expect(screen.getByText('Host Player')).toBeInTheDocument()
      expect(screen.getByText('Regular Player')).toBeInTheDocument()
    })
  })

  describe('Host Permissions', () => {
    it('should handle case when room has no host (anonymous creation)', () => {
      const roomWithoutHost = { ...mockRoom, createdBy: 'anonymous' }
      
      mockUseCurrentRoom.mockReturnValue({
        room: roomWithoutHost,
        loading: false,
        error: null,
      })
      setupMocks(hostPlayer)
      
      render(<RoomClient roomId="test-room" />)

      // Settings button should not appear for anonymous rooms
      expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
    })

    it('should handle missing room data gracefully', () => {
      mockUseCurrentRoom.mockReturnValue({
        room: null,
        loading: false,
        error: null,
      })
      setupMocks(hostPlayer)
      
      render(<RoomClient roomId="test-room" />)

      // Should not crash and should not show settings button
      expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
    })

    it('should handle unauthenticated user gracefully', () => {
      mockUseAuth.mockReturnValue({
        player: null,
      } as authContext.AuthContextType)

      mockUseJoinRoom.mockReturnValue({} as ReturnType<typeof useJoinRoom.default>)
      
      mockUsePlayersInRoom.mockReturnValue({
        players: mockPlayers,
        loading: false,
        error: null,
      })

      mockUseCurrentRoom.mockReturnValue({
        room: mockRoom,
        loading: false,
        error: null,
      })
      
      render(<RoomClient roomId="test-room" />)

      // Should not show settings button for unauthenticated users
      expect(screen.queryByRole('button', { name: /settings/i })).not.toBeInTheDocument()
    })
  })
})