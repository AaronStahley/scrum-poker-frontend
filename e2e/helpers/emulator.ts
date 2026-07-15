const PROJECT_ID = 'thescrumpoker';
const FIRESTORE_BASE = `http://127.0.0.1:8080/emulator/v1/projects/${PROJECT_ID}`;
const AUTH_BASE = `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}`;
const AUTH_SIGNUP_URL = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key';
const DATABASE_URL = `http://127.0.0.1:9000/.json?ns=${PROJECT_ID}-default-rtdb`;

export async function createEmailUser(email: string, password: string, displayName: string): Promise<void> {
  const res = await fetch(AUTH_SIGNUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName, returnSecureToken: false }),
  });
  if (!res.ok) throw new Error(`createEmailUser failed: ${res.status} ${await res.text()}`);
}

export async function clearEmulatorData(): Promise<void> {
  const [firestoreRes, authRes, databaseRes] = await Promise.all([
    fetch(`${FIRESTORE_BASE}/databases/(default)/documents`, { method: 'DELETE' }),
    fetch(`${AUTH_BASE}/accounts`, { method: 'DELETE' }),
    // The database emulator enforces database.rules.json even on REST calls;
    // "Bearer owner" is the emulator-only admin bypass (production has no such header).
    fetch(DATABASE_URL, { method: 'DELETE', headers: { Authorization: 'Bearer owner' } }),
  ]);

  if (!firestoreRes.ok) {
    throw new Error(`Failed to clear Firestore emulator: ${firestoreRes.status}`);
  }
  if (!authRes.ok) {
    throw new Error(`Failed to clear Auth emulator: ${authRes.status}`);
  }
  if (!databaseRes.ok) {
    throw new Error(`Failed to clear Realtime Database emulator: ${databaseRes.status}`);
  }
}
