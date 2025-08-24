import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth'
import * as firebaseAuth from 'firebase/auth'
import { firebaseErrorMessages } from '@/lib/firebase/firebaseErrorMessages'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updatePassword: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  linkWithCredential: vi.fn(),
  signInAnonymously: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('@/lib/firebase/firebase', () => ({
  auth: {},
}))

vi.mock('@/lib/firebase/firebaseErrorMessages', () => ({
  firebaseErrorMessages: {
    'auth/user-not-found': 'No user found with this email.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/wrong-password': 'The current password is incorrect.',
  },
}))

const mockSendPasswordResetEmail = vi.mocked(firebaseAuth.sendPasswordResetEmail)
const mockUpdatePassword = vi.mocked(firebaseAuth.updatePassword)
const mockReauthenticateWithCredential = vi.mocked(firebaseAuth.reauthenticateWithCredential)
const mockEmailAuthProviderCredential = vi.mocked(firebaseAuth.EmailAuthProvider.credential)
const mockOnAuthStateChanged = vi.mocked(firebaseAuth.onAuthStateChanged)

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  isAnonymous: false,
} as firebaseAuth.User

describe('Auth Context - Password Reset Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock the auth state listener to return a user
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser)
      return vi.fn() // unsubscribe function
    })
  })

  const renderAuthHook = () => {
    return renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    })
  }

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      mockSendPasswordResetEmail.mockResolvedValue()
      
      const { result } = renderAuthHook()

      await act(async () => {
        await result.current.sendPasswordResetEmail('test@example.com')
      })

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith({}, 'test@example.com')
    })

    it('should handle user not found error', async () => {
      const error = { code: 'auth/user-not-found' }
      mockSendPasswordResetEmail.mockRejectedValue(error)
      
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.sendPasswordResetEmail('test@example.com')
        })
      ).rejects.toThrow(firebaseErrorMessages['auth/user-not-found'])
    })

    it('should handle invalid email error', async () => {
      const error = { code: 'auth/invalid-email' }
      mockSendPasswordResetEmail.mockRejectedValue(error)
      
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.sendPasswordResetEmail('invalid-email')
        })
      ).rejects.toThrow(firebaseErrorMessages['auth/invalid-email'])
    })

    it('should handle unknown error', async () => {
      const error = { code: 'auth/unknown-error' }
      mockSendPasswordResetEmail.mockRejectedValue(error)
      
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.sendPasswordResetEmail('test@example.com')
        })
      ).rejects.toThrow('Failed to send password reset email')
    })
  })

  describe('updateUserPassword', () => {
    beforeEach(() => {
      const mockCredential = { providerId: 'password' }
      mockEmailAuthProviderCredential.mockReturnValue(mockCredential as firebaseAuth.AuthCredential)
      mockReauthenticateWithCredential.mockResolvedValue({} as firebaseAuth.UserCredential)
      mockUpdatePassword.mockResolvedValue()
    })

    it('should update password successfully', async () => {
      const { result } = renderAuthHook()

      await act(async () => {
        await result.current.updateUserPassword('oldPassword', 'newPassword')
      })

      expect(mockEmailAuthProviderCredential).toHaveBeenCalledWith('test@example.com', 'oldPassword')
      expect(mockReauthenticateWithCredential).toHaveBeenCalledWith(mockUser, expect.any(Object))
      expect(mockUpdatePassword).toHaveBeenCalledWith(mockUser, 'newPassword')
    })

    it('should handle wrong password error', async () => {
      const error = { code: 'auth/wrong-password' }
      mockReauthenticateWithCredential.mockRejectedValue(error)
      
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.updateUserPassword('wrongPassword', 'newPassword')
        })
      ).rejects.toThrow(firebaseErrorMessages['auth/wrong-password'])
    })

    it('should handle weak password error', async () => {
      const error = { code: 'auth/weak-password' }
      mockUpdatePassword.mockRejectedValue(error)
      
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.updateUserPassword('oldPassword', '123')
        })
      ).rejects.toThrow(firebaseErrorMessages['auth/weak-password'])
    })

    it('should throw error when no user is logged in', async () => {
      // Mock no user
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null)
        return vi.fn()
      })
      
      const { result } = renderAuthHook()

      await waitFor(() => {
        expect(result.current.player).toBeNull()
      })

      await expect(
        act(async () => {
          await result.current.updateUserPassword('oldPassword', 'newPassword')
        })
      ).rejects.toThrow('No user is currently logged in')
    })

    it('should handle unknown error during password update', async () => {
      const error = { code: 'auth/unknown-error' }
      mockUpdatePassword.mockRejectedValue(error)
      
      const { result } = renderAuthHook()

      await expect(
        act(async () => {
          await result.current.updateUserPassword('oldPassword', 'newPassword')
        })
      ).rejects.toThrow('Failed to update password')
    })
  })

  describe('loading states', () => {
    it('should set loading to true during sendPasswordResetEmail', async () => {
      let resolvePromise: () => void
      mockSendPasswordResetEmail.mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve
        })
      })
      
      const { result } = renderAuthHook()

      // Start the async operation
      const promise = act(async () => {
        result.current.sendPasswordResetEmail('test@example.com')
      })

      // Check that loading is true during the operation
      expect(result.current.loading).toBe(true)

      // Resolve the promise
      resolvePromise!()
      await promise

      // Check that loading is false after completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should set loading to true during updateUserPassword', async () => {
      let resolveReauth: () => void
      mockReauthenticateWithCredential.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveReauth = resolve
        })
      })
      mockUpdatePassword.mockResolvedValue()
      
      const { result } = renderAuthHook()

      // Start the async operation
      const promise = act(async () => {
        result.current.updateUserPassword('oldPassword', 'newPassword')
      })

      // Check that loading is true during the operation
      expect(result.current.loading).toBe(true)

      // Resolve the promise
      resolveReauth!()
      await promise

      // Check that loading is false after completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })
})