const PROJECT_ID = 'thescrumpoker';
const FIRESTORE_BASE = `http://127.0.0.1:8080/emulator/v1/projects/${PROJECT_ID}`;
const AUTH_BASE = `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}`;

export async function clearEmulatorData(): Promise<void> {
  const [firestoreRes, authRes] = await Promise.all([
    fetch(`${FIRESTORE_BASE}/databases/(default)/documents`, { method: 'DELETE' }),
    fetch(`${AUTH_BASE}/accounts`, { method: 'DELETE' }),
  ]);

  if (!firestoreRes.ok) {
    throw new Error(`Failed to clear Firestore emulator: ${firestoreRes.status}`);
  }
  if (!authRes.ok) {
    throw new Error(`Failed to clear Auth emulator: ${authRes.status}`);
  }
}
