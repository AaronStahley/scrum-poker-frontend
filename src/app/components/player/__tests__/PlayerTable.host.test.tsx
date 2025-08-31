import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PlayerTable from '../PlayerTable'
import { Player } from '../../../../types/player'

describe('PlayerTable - Host Features', () => {
  const mockPlayers: Player[] = [
    {
      id: 'host-player-id',
      name: 'Host Player',
      selection: 5,
      currentRoom: 'test-room',
      lastJoinedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: 'regular-player-id',
      name: 'Regular Player',
      selection: 8,
      currentRoom: 'test-room',
      lastJoinedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: 'another-player-id',
      name: 'Another Player',
      selection: null,
      currentRoom: 'test-room',
      lastJoinedAt: new Date(),
      createdAt: new Date(),
    },
  ]

  const defaultProps = {
    initislSortDirection: 'asc',
    roomOwnerId: 'host-player-id',
    currentPlayerId: 'regular-player-id',
    players: mockPlayers,
    revealVotes: true,
    removePlayer: vi.fn(),
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  const renderAndWaitForLoading = async (props = defaultProps) => {
    render(<PlayerTable {...props} />)
    vi.advanceTimersByTime(1000)
    await waitFor(() => {
      expect(screen.getByText(/Player$/)).toBeInTheDocument()
    })
  }

  describe('Host Visual Indicators', () => {
    it('should show host icon next to room host', async () => {
      await renderAndWaitForLoading()

      const hostRow = screen.getByText('Host Player').closest('tr')
      expect(hostRow).toBeInTheDocument()
      
      // Check if star icon is present (we can test for the title attribute)
      const hostIcon = screen.getByTitle('Room Host')
      expect(hostIcon).toBeInTheDocument()
      expect(hostIcon).toHaveClass('text-yellow-500')
    })

    it('should not show host icon for non-host players', () => {
      render(<PlayerTable {...defaultProps} />)

      // Host icon should only appear once (for the host)
      const hostIcons = screen.getAllByTitle('Room Host')
      expect(hostIcons).toHaveLength(1)
      
      // Regular player should not have host icon
      const regularPlayerRow = screen.getByText('Regular Player').closest('tr')
      expect(regularPlayerRow?.querySelector('[title="Room Host"]')).not.toBeInTheDocument()
    })

    it('should handle missing roomOwnerId gracefully', () => {
      render(<PlayerTable {...defaultProps} roomOwnerId={undefined} />)

      // Should not crash and should not show any host icons
      expect(screen.queryByTitle('Room Host')).not.toBeInTheDocument()
    })

    it('should handle roomOwnerId that does not match any player', () => {
      render(<PlayerTable {...defaultProps} roomOwnerId="non-existent-player" />)

      // Should not crash and should not show any host icons
      expect(screen.queryByTitle('Room Host')).not.toBeInTheDocument()
    })

    it('should show host icon even when host has null selection', () => {
      const playersWithHostHavingNullSelection = mockPlayers.map(player => 
        player.id === 'host-player-id' 
          ? { ...player, selection: null }
          : player
      )

      render(<PlayerTable 
        {...defaultProps} 
        players={playersWithHostHavingNullSelection}
      />)

      const hostIcon = screen.getByTitle('Room Host')
      expect(hostIcon).toBeInTheDocument()
    })

    it('should position host icon correctly with player name', () => {
      render(<PlayerTable {...defaultProps} />)

      const hostPlayerCell = screen.getByText('Host Player').closest('td')
      expect(hostPlayerCell).toBeInTheDocument()
      
      // Check that the cell contains both crown and name in a flex layout
      const flexContainer = hostPlayerCell?.querySelector('.flex.items-center.gap-2')
      expect(flexContainer).toBeInTheDocument()
      
      const hostIcon = screen.getByTitle('Room Host')
      const playerNameSpan = screen.getByText('Host Player')
      
      expect(flexContainer).toContainElement(hostIcon)
      expect(flexContainer).toContainElement(playerNameSpan)
    })
  })

  describe('Host Remove Protection', () => {
    it('should not show remove button for room host', () => {
      render(<PlayerTable {...defaultProps} currentPlayerId="regular-player-id" />)

      const hostRow = screen.getByText('Host Player').closest('tr')
      const removeButton = hostRow?.querySelector('button')
      
      // Host should not have a remove button
      expect(removeButton).not.toBeInTheDocument()
    })

    it('should show remove button for non-host players (when current player is not them)', () => {
      render(<PlayerTable {...defaultProps} currentPlayerId="host-player-id" />)

      const regularPlayerRow = screen.getByText('Regular Player').closest('tr')
      const removeButton = regularPlayerRow?.querySelector('button')
      
      // Regular player should have remove button when viewed by host
      expect(removeButton).toBeInTheDocument()
    })

    it('should not show remove button for current player even if they are not host', () => {
      render(<PlayerTable {...defaultProps} currentPlayerId="regular-player-id" />)

      const currentPlayerRow = screen.getByText('Regular Player').closest('tr')
      const removeButton = currentPlayerRow?.querySelector('button')
      
      // Current player should not be able to remove themselves
      expect(removeButton).not.toBeInTheDocument()
    })
  })

  describe('Host Sorting', () => {
    it('should sort host correctly with other players', () => {
      render(<PlayerTable {...defaultProps} initislSortDirection="asc" />)

      const playerNames = screen.getAllByText(/Player$/).map(el => el.textContent)
      
      // Should be sorted alphabetically: "Another Player", "Host Player", "Regular Player"
      expect(playerNames[0]).toBe('Another Player')
      expect(playerNames[1]).toBe('Host Player')
      expect(playerNames[2]).toBe('Regular Player')
      
      // Host icon should still be on the Host Player regardless of sort order
      const hostIcon = screen.getByTitle('Room Host')
      expect(hostIcon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper accessibility attributes for host icon', () => {
      render(<PlayerTable {...defaultProps} />)

      const hostIcon = screen.getByTitle('Room Host')
      expect(hostIcon).toHaveAttribute('title', 'Room Host')
      
      // Host icon should be identifiable by screen readers
      expect(hostIcon.tagName.toLowerCase()).toBe('svg')
    })
  })
})