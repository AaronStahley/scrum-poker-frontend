import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../theme'
import { useAuth } from '../auth'
import { 
  getPlayerTheme, 
  setPlayerTheme, 
  getPlayerLightTheme,
  setPlayerLightTheme,
  getPlayerDarkTheme,
  setPlayerDarkTheme,
  getPlayerThemeMode,
  setPlayerThemeMode,
  migrateAnonymousThemeToDualSystem
} from '@/lib/firebase/player'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock matchMedia
const mockMatchMedia = vi.fn()

// Setup DOM mocks before tests
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

Object.defineProperty(global, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

// Mock document.documentElement.setAttribute
const mockSetAttribute = vi.fn()
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
  writable: true
})

// Mock Firebase functions
vi.mock('@/lib/firebase/player', () => ({
  getPlayerTheme: vi.fn(),
  setPlayerTheme: vi.fn(),
  getPlayerLightTheme: vi.fn(),
  setPlayerLightTheme: vi.fn(),
  getPlayerDarkTheme: vi.fn(),
  setPlayerDarkTheme: vi.fn(),
  getPlayerThemeMode: vi.fn(),
  setPlayerThemeMode: vi.fn(),
  migrateAnonymousThemeToDualSystem: vi.fn(),
}))

// Mock useAuth hook
vi.mock('../auth', () => ({
  useAuth: vi.fn(),
}))

const mockUseAuth = vi.mocked(useAuth)
const mockGetPlayerTheme = vi.mocked(getPlayerTheme)
const mockSetPlayerTheme = vi.mocked(setPlayerTheme)
const mockGetPlayerLightTheme = vi.mocked(getPlayerLightTheme)
const mockSetPlayerLightTheme = vi.mocked(setPlayerLightTheme)
const mockGetPlayerDarkTheme = vi.mocked(getPlayerDarkTheme)
const mockSetPlayerDarkTheme = vi.mocked(setPlayerDarkTheme)
const mockGetPlayerThemeMode = vi.mocked(getPlayerThemeMode)
const mockSetPlayerThemeMode = vi.mocked(setPlayerThemeMode)
const mockMigrateAnonymousThemeToDualSystem = vi.mocked(migrateAnonymousThemeToDualSystem)

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSetAttribute.mockClear()
    
    // Default auth mock (no user, not loading)
    mockUseAuth.mockReturnValue({
      player: null,
      loading: false,
      showCreateNewPlayerModal: false,
      setShowCreateNewPlayerModal: vi.fn(),
      setPlayer: vi.fn(),
      upgradeAnonymousPlayer: vi.fn(),
      createNewAnonymousPlayer: vi.fn(),
      setPlayerCreated: vi.fn(),
      playerCreated: false,
      pendingRoomId: null,
      setPendingRoomId: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      updateUserPassword: vi.fn(),
      updateDisplayName: vi.fn(),
    })
    
    // Default matchMedia mock
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderThemeHook = () => {
    return renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    })
  }

  describe('theme initialization', () => {
    it('should use anonymous-theme when no user is logged in', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'anonymous-theme') return 'corporate'
        return null
      })

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.theme).toBe('corporate')
        expect(result.current.themeSource).toBe('anonymous')
      })
    })

    it('should use system theme when no preferences exist', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark mode
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.theme).toBe('business')
        expect(result.current.themeSource).toBe('system')
      })
    })

    it('should use user theme from Firebase for authenticated users with legacy single theme', async () => {
      // Mock authenticated user
      mockUseAuth.mockReturnValue({
        player: { uid: 'user123', isAnonymous: false } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        loading: false,
        showCreateNewPlayerModal: false,
        setShowCreateNewPlayerModal: vi.fn(),
        setPlayer: vi.fn(),
        upgradeAnonymousPlayer: vi.fn(),
        createNewAnonymousPlayer: vi.fn(),
        setPlayerCreated: vi.fn(),
        playerCreated: false,
        pendingRoomId: null,
        setPendingRoomId: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        updateUserPassword: vi.fn(),
        updateDisplayName: vi.fn(),
      })
      
      // No dual theme preferences
      mockGetPlayerLightTheme.mockResolvedValue(null)
      mockGetPlayerDarkTheme.mockResolvedValue(null)
      mockGetPlayerThemeMode.mockResolvedValue(null)
      // Legacy single theme exists
      mockGetPlayerTheme.mockResolvedValue('dracula')
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.theme).toBe('dracula')
        expect(result.current.themeSource).toBe('user')
      })
      
      expect(mockGetPlayerTheme).toHaveBeenCalledWith('user123')
      expect(mockSetPlayerLightTheme).toHaveBeenCalledWith('user123', 'corporate')
      expect(mockSetPlayerDarkTheme).toHaveBeenCalledWith('user123', 'dracula')
      expect(mockSetPlayerThemeMode).toHaveBeenCalledWith('user123', 'dark')
    })
    
    it('should migrate anonymous theme to dual theme system on login', async () => {
      // Mock authenticated user
      mockUseAuth.mockReturnValue({
        player: { uid: 'user123', isAnonymous: false } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        loading: false,
        showCreateNewPlayerModal: false,
        setShowCreateNewPlayerModal: vi.fn(),
        setPlayer: vi.fn(),
        upgradeAnonymousPlayer: vi.fn(),
        createNewAnonymousPlayer: vi.fn(),
        setPlayerCreated: vi.fn(),
        playerCreated: false,
        pendingRoomId: null,
        setPendingRoomId: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        updateUserPassword: vi.fn(),
        updateDisplayName: vi.fn(),
      })
      
      // No dual theme preferences
      mockGetPlayerLightTheme.mockResolvedValue(null)
      mockGetPlayerDarkTheme.mockResolvedValue(null)
      mockGetPlayerThemeMode.mockResolvedValue(null)
      mockGetPlayerTheme.mockResolvedValue(null) // No user theme yet
      
      mockMigrateAnonymousThemeToDualSystem.mockResolvedValue()
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'anonymous-theme') return 'corporate'
        return null
      })

      // After migration, return the new dual theme preferences
      mockGetPlayerLightTheme.mockResolvedValueOnce(null).mockResolvedValueOnce('corporate')
      mockGetPlayerDarkTheme.mockResolvedValueOnce(null).mockResolvedValueOnce('business')
      mockGetPlayerThemeMode.mockResolvedValueOnce(null).mockResolvedValueOnce('light')

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.themeSource).toBe('user')
      })
      
      expect(mockMigrateAnonymousThemeToDualSystem).toHaveBeenCalledWith('user123', 'corporate', null)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('anonymous-theme')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('anonymous-theme-mode')
    })

    it('should fall back to business theme when matchMedia is not available', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      // Make matchMedia unavailable
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not available')
      })

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.theme).toBe('business')
        expect(result.current.themeSource).toBe('system')
      })
    })
  })

  describe('setTheme', () => {
    it('should set theme and update localStorage for anonymous users', async () => {
      localStorageMock.getItem.mockReturnValue(null)
      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.themeLoading).toBe(false)
      })

      await act(async () => {
        await result.current.setTheme('emerald')
      })

      expect(result.current.theme).toBe('emerald')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('anonymous-theme', 'emerald')
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'emerald')
      expect(mockSetPlayerTheme).not.toHaveBeenCalled()
    })
  })


  describe('getSystemTheme', () => {
    it('should return business for dark system preference', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderThemeHook()

      expect(result.current.getSystemTheme()).toBe('business')
    })

    it('should return corporate for light system preference', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      const { result } = renderThemeHook()

      expect(result.current.getSystemTheme()).toBe('corporate')
    })
  })

  describe('system theme change listener', () => {
    it('should update theme when system preference changes and no saved themes exist', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      let mediaChangeHandler: (e: { matches: boolean }) => void
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            mediaChangeHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      const { result } = renderThemeHook()
      
      // Initially should be corporate (light)
      expect(result.current.theme).toBe('corporate')

      // Simulate system theme change to dark
      act(() => {
        mediaChangeHandler({ matches: true })
      })

      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'business')
    })

    it('should not update theme when system preference changes if user has saved anonymous theme', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'anonymous-theme') return 'business'
        return null
      })
      
      let mediaChangeHandler: (e: { matches: boolean }) => void
      const mockMediaQuery = {
        matches: false, // Light system preference 
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            mediaChangeHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      const { result } = renderThemeHook()
      
      // Wait for theme to initialize with saved anonymous theme
      await waitFor(() => {
        expect(result.current.theme).toBe('business')
        expect(result.current.themeSource).toBe('anonymous')
      })

      // Simulate system theme change - should not affect the theme since user has saved preference
      act(() => {
        mediaChangeHandler({ matches: true })
      })

      // Theme should remain the same (business, not change to system preference)
      expect(result.current.theme).toBe('business')
    })

    it('should not update theme when system preference changes if user has saved anonymous-theme', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'app-theme') return null
        if (key === 'anonymous-theme') return 'corporate'
        return null
      })
      
      let mediaChangeHandler: (e: { matches: boolean }) => void
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            mediaChangeHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      const { result } = renderThemeHook()
      
      // Should use saved anonymous theme
      expect(result.current.theme).toBe('corporate')

      // Simulate system theme change - should not affect the theme
      act(() => {
        mediaChangeHandler({ matches: true })
      })

      // Theme should remain the same
      expect(result.current.theme).toBe('corporate')
    })
  })

  describe('dual theme system', () => {
    it('should initialize with dual theme preferences for authenticated users', async () => {
      mockUseAuth.mockReturnValue({
        player: { uid: 'user123', isAnonymous: false } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        loading: false,
        showCreateNewPlayerModal: false,
        setShowCreateNewPlayerModal: vi.fn(),
        setPlayer: vi.fn(),
        upgradeAnonymousPlayer: vi.fn(),
        createNewAnonymousPlayer: vi.fn(),
        setPlayerCreated: vi.fn(),
        playerCreated: false,
        pendingRoomId: null,
        setPendingRoomId: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        updateUserPassword: vi.fn(),
        updateDisplayName: vi.fn(),
      })

      mockGetPlayerLightTheme.mockResolvedValue('cupcake')
      mockGetPlayerDarkTheme.mockResolvedValue('dracula')
      mockGetPlayerThemeMode.mockResolvedValue('dark')

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.lightTheme).toBe('cupcake')
        expect(result.current.darkTheme).toBe('dracula')
        expect(result.current.themeMode).toBe('dark')
        expect(result.current.theme).toBe('dracula') // Should use dark theme
      })
    })

    it('should use system theme resolution when themeMode is system', async () => {
      // Make sure we clear all mocks first
      vi.clearAllMocks()
      
      mockUseAuth.mockReturnValue({
        player: { uid: 'user123', isAnonymous: false } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        loading: false,
        showCreateNewPlayerModal: false,
        setShowCreateNewPlayerModal: vi.fn(),
        setPlayer: vi.fn(),
        upgradeAnonymousPlayer: vi.fn(),
        createNewAnonymousPlayer: vi.fn(),
        setPlayerCreated: vi.fn(),
        playerCreated: false,
        pendingRoomId: null,
        setPendingRoomId: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        updateUserPassword: vi.fn(),
        updateDisplayName: vi.fn(),
      })

      // Set up dual theme preferences
      mockGetPlayerLightTheme.mockResolvedValue('cupcake')
      mockGetPlayerDarkTheme.mockResolvedValue('dracula')
      mockGetPlayerThemeMode.mockResolvedValue('system')
      
      // Set up system preference for light theme
      mockMatchMedia.mockReturnValue({
        matches: false, // Light system preference
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })

      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.themeMode).toBe('system')
        expect(result.current.lightTheme).toBe('cupcake')
        expect(result.current.darkTheme).toBe('dracula')
        // Since system preference is light, should use cupcake
        expect(result.current.theme).toBe('cupcake')
      })
    })

    it('should migrate anonymous theme mode preferences to dual system', async () => {
      mockUseAuth.mockReturnValue({
        player: { uid: 'user123', isAnonymous: false } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        loading: false,
        showCreateNewPlayerModal: false,
        setShowCreateNewPlayerModal: vi.fn(),
        setPlayer: vi.fn(),
        upgradeAnonymousPlayer: vi.fn(),
        createNewAnonymousPlayer: vi.fn(),
        setPlayerCreated: vi.fn(),
        playerCreated: false,
        pendingRoomId: null,
        setPendingRoomId: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        updateUserPassword: vi.fn(),
        updateDisplayName: vi.fn(),
      })

      // No existing dual theme preferences
      mockGetPlayerLightTheme.mockResolvedValue(null)
      mockGetPlayerDarkTheme.mockResolvedValue(null)
      mockGetPlayerThemeMode.mockResolvedValue(null)
      mockGetPlayerTheme.mockResolvedValue(null)

      // Anonymous theme mode exists
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'anonymous-theme-mode') return 'dark'
        return null
      })

      mockMigrateAnonymousThemeToDualSystem.mockResolvedValue()
      // After migration
      mockGetPlayerLightTheme.mockResolvedValueOnce(null).mockResolvedValueOnce('corporate')
      mockGetPlayerDarkTheme.mockResolvedValueOnce(null).mockResolvedValueOnce('business')
      mockGetPlayerThemeMode.mockResolvedValueOnce(null).mockResolvedValueOnce('dark')

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(mockMigrateAnonymousThemeToDualSystem).toHaveBeenCalledWith('user123', expect.anything(), 'dark')
        expect(result.current.themeMode).toBe('dark')
      })
    })
  })

  describe('setThemeMode', () => {
    it('should set theme mode and resolve correct theme for authenticated users', async () => {
      mockUseAuth.mockReturnValue({
        player: { uid: 'user123', isAnonymous: false } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        loading: false,
        showCreateNewPlayerModal: false,
        setShowCreateNewPlayerModal: vi.fn(),
        setPlayer: vi.fn(),
        upgradeAnonymousPlayer: vi.fn(),
        createNewAnonymousPlayer: vi.fn(),
        setPlayerCreated: vi.fn(),
        playerCreated: false,
        pendingRoomId: null,
        setPendingRoomId: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        updateUserPassword: vi.fn(),
        updateDisplayName: vi.fn(),
      })

      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.themeLoading).toBe(false)
      })

      await act(async () => {
        await result.current.setThemeMode('light')
      })

      expect(mockSetPlayerThemeMode).toHaveBeenCalledWith('user123', 'light')
      expect(result.current.themeMode).toBe('light')
    })

    it('should set anonymous theme mode for anonymous users', async () => {
      const { result } = renderThemeHook()

      await waitFor(() => {
        expect(result.current.themeLoading).toBe(false)
      })

      act(() => {
        result.current.setAnonymousThemeMode('dark')
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('anonymous-theme-mode', 'dark')
      expect(result.current.themeMode).toBe('dark')
      expect(result.current.theme).toBe('business') // Should use business theme for anonymous dark
    })
  })
})