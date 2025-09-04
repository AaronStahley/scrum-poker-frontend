import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeModeSelector from '../ThemeModeSelector'
import { useTheme } from '@/app/contexts/theme'
import { useAuth } from '@/app/contexts/auth'

// Mock the useTheme hook
vi.mock('@/app/contexts/theme', () => ({
  useTheme: vi.fn(),
}))

// Mock the useAuth hook
vi.mock('@/app/contexts/auth', () => ({
  useAuth: vi.fn(),
}))

// Mock Heroicons
vi.mock('@heroicons/react/20/solid', () => ({
  ChevronDownIcon: ({ className }: { className?: string }) => (
    <div data-testid="chevron-down-icon" className={className}>Chevron</div>
  ),
}))

vi.mock('@heroicons/react/24/outline', () => ({
  ComputerDesktopIcon: ({ className }: { className?: string }) => (
    <div data-testid="computer-desktop-icon" className={className}>Computer</div>
  ),
  SunIcon: ({ className }: { className?: string }) => (
    <div data-testid="sun-icon" className={className}>Sun</div>
  ),
  MoonIcon: ({ className }: { className?: string }) => (
    <div data-testid="moon-icon" className={className}>Moon</div>
  ),
}))

const mockUseTheme = vi.mocked(useTheme)
const mockUseAuth = vi.mocked(useAuth)

describe('ThemeModeSelector', () => {
  const mockSetThemeMode = vi.fn()
  const mockSetAnonymousThemeMode = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseTheme.mockReturnValue({
      themeMode: 'system',
      setThemeMode: mockSetThemeMode,
      setAnonymousThemeMode: mockSetAnonymousThemeMode,
      theme: 'business',
      setTheme: vi.fn(),
      themes: [],
      getSystemTheme: vi.fn(),
      themeLoading: false,
      themeSource: 'system',
      lightTheme: 'corporate',
      darkTheme: 'business',
      setLightTheme: vi.fn(),
      setDarkTheme: vi.fn(),
    })

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
  })

  it('should render system mode by default', () => {
    render(<ThemeModeSelector />)

    const mainButton = screen.getByLabelText('Current theme mode: System. Click to change theme mode.')
    expect(mainButton).toBeInTheDocument()
    
    // Check that the main button has the correct icon and text
    const mainButtonIcons = screen.getAllByTestId('computer-desktop-icon')
    expect(mainButtonIcons.length).toBeGreaterThan(0)
    
    // Check that "System" appears somewhere in the document (could be button or dropdown)
    expect(screen.getAllByText('System').length).toBeGreaterThan(0)
  })

  it('should render light mode when themeMode is light', () => {
    mockUseTheme.mockReturnValue({
      ...mockUseTheme(),
      themeMode: 'light',
    })

    render(<ThemeModeSelector />)

    const mainButton = screen.getByLabelText('Current theme mode: Light. Click to change theme mode.')
    expect(mainButton).toBeInTheDocument()
    
    expect(screen.getAllByTestId('sun-icon').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Light').length).toBeGreaterThan(0)
  })

  it('should render dark mode when themeMode is dark', () => {
    mockUseTheme.mockReturnValue({
      ...mockUseTheme(),
      themeMode: 'dark',
    })

    render(<ThemeModeSelector />)

    const mainButton = screen.getByLabelText('Current theme mode: Dark. Click to change theme mode.')
    expect(mainButton).toBeInTheDocument()
    
    expect(screen.getAllByTestId('moon-icon').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dark').length).toBeGreaterThan(0)
  })

  it('should open dropdown menu when clicked', () => {
    render(<ThemeModeSelector />)

    const mainButton = screen.getByLabelText('Current theme mode: System. Click to change theme mode.')
    fireEvent.click(mainButton)

    // Check that all three options are present in dropdown
    expect(screen.getAllByText('System')).toHaveLength(2) // One in button, one in dropdown
    expect(screen.getAllByText('Light')).toHaveLength(1)
    expect(screen.getAllByText('Dark')).toHaveLength(1)
    
    // Check descriptions
    expect(screen.getByText('Follow system preference')).toBeInTheDocument()
  })

  it('should call setAnonymousThemeMode for anonymous users', () => {
    render(<ThemeModeSelector />)

    const mainButton = screen.getByLabelText('Current theme mode: System. Click to change theme mode.')
    fireEvent.click(mainButton)

    // Find the light option in the dropdown by its text content
    const lightOption = screen.getAllByText('Light').find(el => 
      el.closest('button')?.getAttribute('aria-pressed') === 'false'
    )?.closest('button')
    
    if (lightOption) {
      fireEvent.click(lightOption)
    }

    expect(mockSetAnonymousThemeMode).toHaveBeenCalledWith('light')
    expect(mockSetThemeMode).not.toHaveBeenCalled()
  })

  it('should call setThemeMode for authenticated users', () => {
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

    render(<ThemeModeSelector />)

    const mainButton = screen.getByLabelText('Current theme mode: System. Click to change theme mode.')
    fireEvent.click(mainButton)

    // Find the dark option in the dropdown
    const darkOption = screen.getAllByText('Dark').find(el => 
      el.closest('button')?.getAttribute('aria-pressed') === 'false'
    )?.closest('button')
    
    if (darkOption) {
      fireEvent.click(darkOption)
    }

    expect(mockSetThemeMode).toHaveBeenCalledWith('dark')
    expect(mockSetAnonymousThemeMode).not.toHaveBeenCalled()
  })

  it('should show different descriptions for anonymous vs authenticated users', () => {
    // Test anonymous user first
    const { unmount } = render(<ThemeModeSelector />)
    
    const mainButton = screen.getByLabelText('Current theme mode: System. Click to change theme mode.')
    fireEvent.click(mainButton)

    expect(screen.getByText('Corporate theme')).toBeInTheDocument()
    expect(screen.getByText('Business theme')).toBeInTheDocument()

    // Clean up and test authenticated user
    unmount()

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

    render(<ThemeModeSelector />)
    
    const authButton = screen.getByLabelText('Current theme mode: System. Click to change theme mode.')
    fireEvent.click(authButton)

    expect(screen.getByText('Use light theme')).toBeInTheDocument()
    expect(screen.getByText('Use dark theme')).toBeInTheDocument()
  })

  it('should highlight the currently selected theme mode', () => {
    mockUseTheme.mockReturnValue({
      ...mockUseTheme(),
      themeMode: 'light',
    })

    render(<ThemeModeSelector />)

    const mainButton = screen.getByLabelText('Current theme mode: Light. Click to change theme mode.')
    fireEvent.click(mainButton)

    // Find the light option that should be selected by its aria-pressed attribute
    const lightOption = screen.getByRole('button', { pressed: true })
    expect(lightOption).toHaveClass('bg-primary/10', 'text-primary')

    // Check that there's a system option that's not pressed
    const buttons = screen.getAllByRole('button')
    const systemOption = buttons.find(button => 
      button.getAttribute('aria-describedby') === 'theme-mode-system-desc'
    )
    expect(systemOption).toHaveAttribute('aria-pressed', 'false')
    expect(systemOption).not.toHaveClass('bg-primary/10', 'text-primary')
  })
})