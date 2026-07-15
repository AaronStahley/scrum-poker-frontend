import '@testing-library/jest-dom'
import { beforeAll, vi } from 'vitest'

// Mock Firebase
vi.mock('@/lib/firebase/firebase', () => ({
  db: {},
  auth: {
    currentUser: null,
  },
  rtdb: {},
  getFirebaseNoReplyEmail: vi.fn(() => 'noreply@test.firebaseapp.com'),
}))

// Mock Firebase functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  arrayUnion: vi.fn(),
  collectionGroup: vi.fn(),
}))

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(),
  ref: vi.fn(),
  onValue: vi.fn(() => () => {}),
  onDisconnect: vi.fn(),
  set: vi.fn(),
  serverTimestamp: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  linkWithCredential: vi.fn(),
  signInAnonymously: vi.fn(),
  updateProfile: vi.fn(),
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

beforeAll(() => {
  // Setup global test environment
})