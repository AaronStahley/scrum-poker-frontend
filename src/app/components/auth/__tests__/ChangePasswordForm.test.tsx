import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChangePasswordForm from '../ChangePasswordForm'
import * as authContext from '@/app/contexts/auth'

// Mock auth context
vi.mock('@/app/contexts/auth', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(authContext.useAuth)
const mockUpdateUserPassword = vi.fn()
const mockOnSuccess = vi.fn()

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      updateUserPassword: mockUpdateUserPassword,
    } as ReturnType<typeof authContext.useAuth>)
  })

  it('should render change password form', () => {
    render(<ChangePasswordForm />)

    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter current password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<ChangePasswordForm />)

    const submitButton = screen.getByRole('button', { name: /update password/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    expect(mockUpdateUserPassword).not.toHaveBeenCalled()
  })

  it('should validate new password length', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'oldpassword')
    await user.type(newPasswordInput, '123')
    await user.type(confirmPasswordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/new password must be at least 6 characters long/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPassword).not.toHaveBeenCalled()
  })

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'oldpassword')
    await user.type(newPasswordInput, 'newpassword')
    await user.type(confirmPasswordInput, 'differentpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/new passwords do not match/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPassword).not.toHaveBeenCalled()
  })

  it('should validate that new password is different from current', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'samepassword')
    await user.type(newPasswordInput, 'samepassword')
    await user.type(confirmPasswordInput, 'samepassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/new password must be different from current password/i)).toBeInTheDocument()
    })

    expect(mockUpdateUserPassword).not.toHaveBeenCalled()
  })

  it('should update password successfully', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockUpdateUserPassword.mockResolvedValue(undefined)
    
    render(<ChangePasswordForm onSuccess={mockOnSuccess} />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'oldpassword')
    await user.type(newPasswordInput, 'newpassword')
    await user.type(confirmPasswordInput, 'newpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockUpdateUserPassword).toHaveBeenCalledWith('oldpassword', 'newpassword')
    })

    await waitFor(() => {
      expect(screen.getByText(/password updated successfully!/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).toHaveBeenCalled()

    // Fields should be cleared after successful update
    expect(currentPasswordInput).toHaveValue('')
    expect(newPasswordInput).toHaveValue('')
    expect(confirmPasswordInput).toHaveValue('')
  })

  it('should handle password update error', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const errorMessage = 'The current password is incorrect.'
    mockUpdateUserPassword.mockRejectedValue(new Error(errorMessage))
    
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'wrongpassword')
    await user.type(newPasswordInput, 'newpassword')
    await user.type(confirmPasswordInput, 'newpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Fields should retain their values after error
    expect(currentPasswordInput).toHaveValue('wrongpassword')
    expect(newPasswordInput).toHaveValue('newpassword')
    expect(confirmPasswordInput).toHaveValue('newpassword')
  })

  it('should show loading state while updating password', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    let resolvePromise: () => void
    mockUpdateUserPassword.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise = resolve
      })
    })
    
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'oldpassword')
    await user.type(newPasswordInput, 'newpassword')
    await user.type(confirmPasswordInput, 'newpassword')
    await user.click(submitButton)

    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /updating.../i })).toBeInTheDocument()
    })
    expect(currentPasswordInput).toBeDisabled()
    expect(newPasswordInput).toBeDisabled()
    expect(confirmPasswordInput).toBeDisabled()

    // Resolve the promise
    resolvePromise!()
    
    await waitFor(() => {
      expect(screen.getByText(/password updated successfully!/i)).toBeInTheDocument()
    })
  })

  it('should clear success message after 5 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockUpdateUserPassword.mockResolvedValue(undefined)
    
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'oldpassword')
    await user.type(newPasswordInput, 'newpassword')
    await user.type(confirmPasswordInput, 'newpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password updated successfully!/i)).toBeInTheDocument()
    })

    // Advance timers by 5 seconds
    vi.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(screen.queryByText(/password updated successfully!/i)).not.toBeInTheDocument()
    })
  })

  it('should clear error when retrying after failed submission', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockUpdateUserPassword
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined)
    
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentPasswordInput, 'oldpassword')
    await user.type(newPasswordInput, 'newpassword')
    await user.type(confirmPasswordInput, 'newpassword')

    // First submission - should fail
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Second submission - should succeed and clear error
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('Network error')).not.toBeInTheDocument()
      expect(screen.getByText(/password updated successfully!/i)).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', () => {
    render(<ChangePasswordForm />)

    const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    expect(currentPasswordInput).toHaveAttribute('type', 'password')
    expect(currentPasswordInput).toHaveAttribute('required')
    expect(currentPasswordInput).toHaveAttribute('autoComplete', 'current-password')

    expect(newPasswordInput).toHaveAttribute('type', 'password')
    expect(newPasswordInput).toHaveAttribute('required')
    expect(newPasswordInput).toHaveAttribute('minLength', '6')
    expect(newPasswordInput).toHaveAttribute('autoComplete', 'new-password')

    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('required')
    expect(confirmPasswordInput).toHaveAttribute('minLength', '6')
    expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password')

    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})