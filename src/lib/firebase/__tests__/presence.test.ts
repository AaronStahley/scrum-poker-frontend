import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initPresence, subscribeToPresence } from '../presence'
import * as database from 'firebase/database'

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  onValue: vi.fn(),
  onDisconnect: vi.fn(),
  set: vi.fn(),
  serverTimestamp: vi.fn(),
}))

const mockRef = vi.mocked(database.ref)
const mockOnValue = vi.mocked(database.onValue)
const mockOnDisconnect = vi.mocked(database.onDisconnect)
const mockSet = vi.mocked(database.set)
const mockServerTimestamp = vi.mocked(database.serverTimestamp)

describe('initPresence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRef.mockImplementation((_db, path) => ({ path } as unknown as database.DatabaseReference))
    mockServerTimestamp.mockReturnValue('SERVER_TIMESTAMP' as unknown as object)
  })

  it('arms onDisconnect and marks the player online once .info/connected reports true', async () => {
    const disconnectSet = vi.fn().mockResolvedValue(undefined)
    mockOnDisconnect.mockReturnValue({ set: disconnectSet } as unknown as database.OnDisconnect)
    mockSet.mockResolvedValue(undefined)

    let connectedCallback: (snap: { val: () => unknown }) => void = () => {}
    mockOnValue.mockImplementation((_ref, cb) => {
      connectedCallback = cb as typeof connectedCallback
      return vi.fn()
    })

    initPresence('player-1')
    connectedCallback({ val: () => true })
    await Promise.resolve()
    await Promise.resolve()

    expect(mockOnDisconnect).toHaveBeenCalledWith({ path: 'presence/player-1' })
    expect(disconnectSet).toHaveBeenCalledWith({ online: false, lastChanged: 'SERVER_TIMESTAMP' })
    expect(mockSet).toHaveBeenCalledWith({ path: 'presence/player-1' }, { online: true, lastChanged: 'SERVER_TIMESTAMP' })
  })

  it('does nothing when .info/connected reports false', () => {
    let connectedCallback: (snap: { val: () => unknown }) => void = () => {}
    mockOnValue.mockImplementation((_ref, cb) => {
      connectedCallback = cb as typeof connectedCallback
      return vi.fn()
    })

    initPresence('player-1')
    connectedCallback({ val: () => false })

    expect(mockOnDisconnect).not.toHaveBeenCalled()
    expect(mockSet).not.toHaveBeenCalled()
  })

  it('explicitly marks the player offline on cleanup, on top of unsubscribing', () => {
    const unsubscribeConnectedListener = vi.fn()
    mockOnValue.mockReturnValue(unsubscribeConnectedListener)
    mockSet.mockResolvedValue(undefined)

    const cleanup = initPresence('player-1')
    cleanup()

    expect(unsubscribeConnectedListener).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalledWith({ path: 'presence/player-1' }, { online: false, lastChanged: 'SERVER_TIMESTAMP' })
  })
})

describe('subscribeToPresence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRef.mockImplementation((_db, path) => ({ path } as unknown as database.DatabaseReference))
  })

  it('reports online true with the last-changed date when present', () => {
    mockOnValue.mockImplementation((_ref, cb) => {
      (cb as (snap: { val: () => unknown }) => void)({ val: () => ({ online: true, lastChanged: 1735689600000 }) })
      return vi.fn()
    })

    const callback = vi.fn()
    subscribeToPresence('player-1', callback)

    expect(callback).toHaveBeenCalledWith(true, new Date(1735689600000))
  })

  it('reports offline/null when there is no presence data yet', () => {
    mockOnValue.mockImplementation((_ref, cb) => {
      (cb as (snap: { val: () => unknown }) => void)({ val: () => null })
      return vi.fn()
    })

    const callback = vi.fn()
    subscribeToPresence('player-1', callback)

    expect(callback).toHaveBeenCalledWith(false, null)
  })
})
