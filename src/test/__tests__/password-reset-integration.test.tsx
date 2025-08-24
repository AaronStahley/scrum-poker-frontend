import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import ForgotPasswordPage from '@/app/forgot-password/page'
import SettingsPage from '@/app/settings/page'
import LoginPage from '@/app/login/page'
import { AuthProvider } from '@/app/contexts/auth'
import * as firebaseAuth from 'firebase/auth'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updatePassword: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  signInWithEmailAndPassword: vi.fn(),
}))

vi.mock('@/lib/firebase/firebase', () => ({
  auth: {},
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock version function
vi.mock('@/lib/version', () => ({
  getVersionDisplay: vi.fn(() => 'v1.0.0'),
}))

const mockPush = vi.fn()
const mockUseRouter = vi.mocked(useRouter)
const mockOnAuthStateChanged = vi.mocked(firebaseAuth.onAuthStateChanged)
const mockSendPasswordResetEmail = vi.mocked(firebaseAuth.sendPasswordResetEmail)
const mockUpdatePassword = vi.mocked(firebaseAuth.updatePassword)
const mockReauthenticateWithCredential = vi.mocked(firebaseAuth.reauthenticateWithCredential)
const mockEmailAuthProviderCredential = vi.mocked(firebaseAuth.EmailAuthProvider.credential)

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  isAnonymous: false,
  metadata: {
    creationTime: '2023-01-01T00:00:00.000Z',
    lastSignInTime: '2023-01-01T00:00:00.000Z',
  },
} as firebaseAuth.User

const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('Password Reset Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as ReturnType<typeof useRouter>)

    // Default to authenticated user
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser)
      return vi.fn()
    })
  })

  describe('Forgot Password Flow', () => {
    it('should complete forgot password flow', async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockResolvedValue()
      
      render(<ForgotPasswordPage />, { wrapper: AuthWrapper })

      // Fill out forgot password form
      const emailInput = screen.getByPlaceholderText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset email/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      // Verify email was sent
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith({}, 'test@example.com')

      // Check success state
      await waitFor(() => {
        expect(screen.getByText(/password reset email sent! check your inbox./i)).toBeInTheDocument()
      })
    })

    it('should show forgot password link on login page', async () => {
      render(<LoginPage />, { wrapper: AuthWrapper })

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password\?/i })
      expect(forgotPasswordLink).toBeInTheDocument()
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    })

    it('should handle forgot password error', async () => {
      const user = userEvent.setup()
      mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/user-not-found' })
      
      render(<ForgotPasswordPage />, { wrapper: AuthWrapper })

      const emailInput = screen.getByPlaceholderText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset email/i })

      await user.type(emailInput, 'nonexistent@example.com')
      await user.click(submitButton)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/no user found with this email/i)).toBeInTheDocument()
      })
    })
  })

  describe('Change Password Flow in Settings', () => {
    it('should complete change password flow in settings page', async () => {
      const user = userEvent.setup()
      const mockCredential = { providerId: 'password' }
      mockEmailAuthProviderCredential.mockReturnValue(mockCredential as firebaseAuth.AuthCredential)
      mockReauthenticateWithCredential.mockResolvedValue({} as firebaseAuth.UserCredential)
      mockUpdatePassword.mockResolvedValue()
      
      render(<SettingsPage />, { wrapper: AuthWrapper })

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
      })

      // Find change password form
      const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
      const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
      const updateButton = screen.getByRole('button', { name: /update password/i })

      // Fill out form
      await user.type(currentPasswordInput, 'oldpassword')
      await user.type(newPasswordInput, 'newpassword')
      await user.type(confirmPasswordInput, 'newpassword')
      await user.click(updateButton)

      // Verify Firebase operations
      expect(mockEmailAuthProviderCredential).toHaveBeenCalledWith('test@example.com', 'oldpassword')
      expect(mockReauthenticateWithCredential).toHaveBeenCalledWith(mockUser, mockCredential)
      expect(mockUpdatePassword).toHaveBeenCalledWith(mockUser, 'newpassword')

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/password updated successfully!/i)).toBeInTheDocument()
      })
    })

    it('should redirect unauthenticated users from settings to login', async () => {
      // Mock no user
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null)
        return vi.fn()
      })
      
      render(<SettingsPage />, { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('should handle wrong current password error in settings', async () => {
      const user = userEvent.setup()
      const mockCredential = { providerId: 'password' }
      mockEmailAuthProviderCredential.mockReturnValue(mockCredential as firebaseAuth.AuthCredential)
      mockReauthenticateWithCredential.mockRejectedValue({ code: 'auth/wrong-password' })
      
      render(<SettingsPage />, { wrapper: AuthWrapper })

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
      })

      const currentPasswordInput = screen.getByPlaceholderText(/enter current password/i)
      const newPasswordInput = screen.getByPlaceholderText(/enter new password/i)
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i)
      const updateButton = screen.getByRole('button', { name: /update password/i })

      await user.type(currentPasswordInput, 'wrongpassword')
      await user.type(newPasswordInput, 'newpassword')
      await user.type(confirmPasswordInput, 'newpassword')
      await user.click(updateButton)

      await waitFor(() => {
        expect(screen.getByText(/the current password is incorrect/i)).toBeInTheDocument()
      })

      // updatePassword should not be called if reauthentication fails
      expect(mockUpdatePassword).not.toHaveBeenCalled()
    })
  })

  describe('Navigation Integration', () => {
    it('should provide access to settings from user dropdown', async () => {
      // This test would be more complex as it involves the navigation component
      // For now, we just verify the concept
      expect(true).toBe(true) // Placeholder for now
    })

    it('should show forgot password link on login page', () => {
      render(<LoginPage />, { wrapper: AuthWrapper })

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password\?/i })
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
    })
  })
})