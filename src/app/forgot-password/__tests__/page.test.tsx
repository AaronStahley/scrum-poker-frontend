import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import ForgotPasswordPage from '../page'
import * as authContext from '@/app/contexts/auth'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock auth context
vi.mock('@/app/contexts/auth', () => ({
  useAuth: vi.fn(),
}))

const mockPush = vi.fn()
const mockUseRouter = vi.mocked(useRouter)
const mockUseAuth = vi.mocked(authContext.useAuth)
const mockSendPasswordResetEmail = vi.fn()

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
    vi.useFakeTimers()
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as ReturnType<typeof useRouter>)

    mockUseAuth.mockReturnValue({
      sendPasswordResetEmail: mockSendPasswordResetEmail,
    } as ReturnType<typeof authContext.useAuth>)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render forgot password form', () => {
    render(<ForgotPasswordPage />)

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument()
    expect(screen.getByText(/enter your email address and we'll send you a link/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset email/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument()
  })

  it('should validate required email field', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ForgotPasswordPage />)

    const submitButton = screen.getByRole('button', { name: /send reset email/i })
    await user.click(submitButton)

    // HTML5 validation should prevent submission
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('should send password reset email successfully', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockSendPasswordResetEmail.mockResolvedValue(undefined)
    
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('test@example.com')
    
    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText(/password reset email sent! check your inbox./i)).toBeInTheDocument()
    })

    expect(screen.getByText(/redirecting to login page/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /go to login now/i })).toBeInTheDocument()
  })

  it('should handle error when sending password reset email', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const errorMessage = 'No user found with this email.'
    mockSendPasswordResetEmail.mockRejectedValue(new Error(errorMessage))
    
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })

    await user.type(emailInput, 'nonexistent@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    // Should still show the form
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset email/i })).toBeInTheDocument()
  })

  it('should show loading state while sending email', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    let resolvePromise: () => void
    mockSendPasswordResetEmail.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise = resolve
      })
    })
    
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Check loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sending.../i })).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText(/email/i)).toBeDisabled()

    // Resolve the promise
    resolvePromise!()
    
    await waitFor(() => {
      expect(screen.getByText(/password reset email sent! check your inbox./i)).toBeInTheDocument()
    })
  })

  it('should redirect to login page after 3 seconds on success', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockSendPasswordResetEmail.mockResolvedValue(undefined)
    
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password reset email sent! check your inbox./i)).toBeInTheDocument()
    })

    // Advance timers by 3 seconds
    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('should allow manual navigation to login from success page', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockSendPasswordResetEmail.mockResolvedValue(undefined)
    
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password reset email sent! check your inbox./i)).toBeInTheDocument()
    })

    const loginNowLink = screen.getByRole('link', { name: /go to login now/i })
    expect(loginNowLink).toHaveAttribute('href', '/login')
  })

  it('should clear error when retrying after failed submission', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    mockSendPasswordResetEmail
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(undefined)
    
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })

    // First submission - should fail
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    // Second submission - should succeed
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText('Network error')).not.toBeInTheDocument()
      expect(screen.getByText(/password reset email sent! check your inbox./i)).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', () => {
    render(<ForgotPasswordPage />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send reset email/i })

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})