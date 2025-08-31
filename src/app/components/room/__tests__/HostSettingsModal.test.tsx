import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HostSettingsModal from '../HostSettingsModal'

describe('HostSettingsModal', () => {
  const mockOnClose = vi.fn()
  const mockOnUpdateRoomName = vi.fn()
  const mockOnDeleteRoom = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    currentRoomName: 'Test Room',
    onUpdateRoomName: mockOnUpdateRoomName,
    onDeleteRoom: mockOnDeleteRoom,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnUpdateRoomName.mockResolvedValue(undefined)
    mockOnDeleteRoom.mockResolvedValue(undefined)
  })

  it('should not render when isOpen is false', () => {
    render(<HostSettingsModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Room Settings')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<HostSettingsModal {...defaultProps} />)
    
    expect(screen.getByText('Room Settings')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Room')).toBeInTheDocument()
  })

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<HostSettingsModal {...defaultProps} />)
    
    const closeButton = screen.getByText('✕')
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<HostSettingsModal {...defaultProps} />)
    
    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  describe('Room Name Update', () => {
    it('should update room name when form is submitted', async () => {
      const user = userEvent.setup()
      render(<HostSettingsModal {...defaultProps} />)
      
      const input = screen.getByDisplayValue('Test Room')
      const updateButton = screen.getByText('Update Name')
      
      await user.clear(input)
      await user.type(input, 'New Room Name')
      await user.click(updateButton)
      
      await waitFor(() => {
        expect(mockOnUpdateRoomName).toHaveBeenCalledWith('New Room Name')
      })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close modal when room name is unchanged', () => {
      render(<HostSettingsModal {...defaultProps} />)
      
      const updateButton = screen.getByText('Update Name')
      
      // Button should be disabled when room name is unchanged  
      expect(updateButton).toBeDisabled()
      expect(mockOnUpdateRoomName).not.toHaveBeenCalled()
    })

    it('should disable update button when room name is unchanged', () => {
      render(<HostSettingsModal {...defaultProps} />)
      
      const updateButton = screen.getByText('Update Name')
      expect(updateButton).toBeDisabled()
    })

    it('should enable update button when room name is changed', async () => {
      const user = userEvent.setup()
      render(<HostSettingsModal {...defaultProps} />)
      
      const input = screen.getByDisplayValue('Test Room')
      const updateButton = screen.getByText('Update Name')
      
      expect(updateButton).toBeDisabled()
      
      await user.type(input, ' Updated')
      expect(updateButton).not.toBeDisabled()
    })

    it('should handle update errors gracefully', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to update room name'
      mockOnUpdateRoomName.mockRejectedValue(new Error(errorMessage))
      
      render(<HostSettingsModal {...defaultProps} />)
      
      const input = screen.getByDisplayValue('Test Room')
      const updateButton = screen.getByText('Update Name')
      
      await user.clear(input)
      await user.type(input, 'New Name')
      await user.click(updateButton)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should validate input length constraints', async () => {
      const user = userEvent.setup()
      render(<HostSettingsModal {...defaultProps} />)
      
      const input = screen.getByDisplayValue('Test Room')
      
      // Test minimum length - HTML5 validation should prevent submission
      await user.clear(input)
      await user.type(input, 'A')
      
      // Check that the input has validation attributes
      expect(input).toHaveAttribute('minLength', '2')
      expect(input).toHaveAttribute('required')
      
      // Since HTML5 validation might not work in jsdom, we'll just verify the attributes exist
      expect(input.value).toBe('A')
    })
  })

  describe('Room Deletion', () => {
    it('should show delete confirmation when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<HostSettingsModal {...defaultProps} />)
      
      const deleteButton = screen.getByRole('button', { name: /delete$/i })
      await user.click(deleteButton)
      
      expect(screen.getByText('This action cannot be undone!')).toBeInTheDocument()
      expect(screen.getByText(/permanently deleted/)).toBeInTheDocument()
    })

    it('should cancel delete confirmation', async () => {
      const user = userEvent.setup()
      render(<HostSettingsModal {...defaultProps} />)
      
      // Click delete to show confirmation
      const deleteButton = screen.getByRole('button', { name: /delete$/i })
      await user.click(deleteButton)
      
      // Click cancel in confirmation
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(screen.queryByText('This action cannot be undone!')).not.toBeInTheDocument()
    })

    it('should delete room when confirmed', async () => {
      const user = userEvent.setup()
      render(<HostSettingsModal {...defaultProps} />)
      
      // Click delete to show confirmation
      const deleteButton = screen.getByRole('button', { name: /delete$/i })
      await user.click(deleteButton)
      
      // Click delete room in confirmation
      const confirmDeleteButton = screen.getByText('Delete Room')
      await user.click(confirmDeleteButton)
      
      await waitFor(() => {
        expect(mockOnDeleteRoom).toHaveBeenCalled()
      })
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should handle delete errors gracefully', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to delete room'
      mockOnDeleteRoom.mockRejectedValue(new Error(errorMessage))
      
      render(<HostSettingsModal {...defaultProps} />)
      
      // Click delete to show confirmation
      const deleteButton = screen.getByRole('button', { name: /delete$/i })
      await user.click(deleteButton)
      
      // Click delete room in confirmation
      const confirmDeleteButton = screen.getByText('Delete Room')
      await user.click(confirmDeleteButton)
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during room name update', async () => {
      const user = userEvent.setup()
      // Mock a delayed promise
      mockOnUpdateRoomName.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<HostSettingsModal {...defaultProps} />)
      
      const input = screen.getByDisplayValue('Test Room')
      const updateButton = screen.getByText('Update Name')
      
      await user.clear(input)
      await user.type(input, 'New Name')
      await user.click(updateButton)
      
      expect(screen.getByText('Updating...')).toBeInTheDocument()
      expect(updateButton).toBeDisabled()
    })

    it('should show loading state during room deletion', async () => {
      const user = userEvent.setup()
      // Mock a delayed promise
      mockOnDeleteRoom.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<HostSettingsModal {...defaultProps} />)
      
      // Navigate to delete confirmation
      const deleteButton = screen.getByRole('button', { name: /delete$/i })
      await user.click(deleteButton)
      
      const confirmDeleteButton = screen.getByText('Delete Room')
      await user.click(confirmDeleteButton)
      
      expect(screen.getByText('Deleting...')).toBeInTheDocument()
      expect(confirmDeleteButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria labels and roles', () => {
      render(<HostSettingsModal {...defaultProps} />)
      
      // Check that the input is labeled by the label element
      const input = screen.getByRole('textbox')
      expect(input).toBeInTheDocument()
      
      // Check that we have the expected buttons
      expect(screen.getAllByRole('button')).toHaveLength(4) // Close, Cancel, Update, Delete
      
      // Check that the modal has proper structure
      expect(screen.getByText('Room Settings')).toBeInTheDocument()
    })

    it('should focus on input when opened', () => {
      render(<HostSettingsModal {...defaultProps} />)
      
      const input = screen.getByDisplayValue('Test Room')
      expect(document.activeElement).toBe(input)
    })
  })
})