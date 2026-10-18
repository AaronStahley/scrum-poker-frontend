// Realtime Database security rules tests for the presence feature.
// Run with `npm run test:rules`, which starts the Database emulator.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { get, ref, remove, serverTimestamp, set, update } from 'firebase/database';

const ALICE = 'alice-uid';
const BOB = 'bob-uid';

let env: RulesTestEnvironment;

const rtdb = (uid?: string) =>
  uid ? env.authenticatedContext(uid).database() : env.unauthenticatedContext().database();

const presenceRef = (uid: string | undefined, playerId: string) => ref(rtdb(uid), `presence/${playerId}`);

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-scrum-poker-rules',
    database: {
      rules: readFileSync(resolve(__dirname, '../database.rules.json'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearDatabase();
});

describe('presence', () => {
  it('allows writing your own presence the way the app does', async () => {
    await assertSucceeds(set(presenceRef(ALICE, ALICE), { online: true, lastChanged: serverTimestamp() }));
    await assertSucceeds(set(presenceRef(ALICE, ALICE), { online: false, lastChanged: serverTimestamp() }));
  });

  it("denies writing someone else's presence", async () => {
    await assertFails(set(presenceRef(ALICE, BOB), { online: true, lastChanged: serverTimestamp() }));
  });

  it('denies writes when signed out', async () => {
    await assertFails(set(presenceRef(undefined, ALICE), { online: true, lastChanged: serverTimestamp() }));
  });

  it('lets signed-in users read presence', async () => {
    await assertSucceeds(get(presenceRef(BOB, ALICE)));
    await assertFails(get(presenceRef(undefined, ALICE)));
  });

  it('denies extra fields', async () => {
    await assertFails(set(presenceRef(ALICE, ALICE), {
      online: true, lastChanged: serverTimestamp(), payload: 'x'.repeat(1000),
    }));
  });

  it('denies missing or wrongly typed fields', async () => {
    await assertFails(set(presenceRef(ALICE, ALICE), { online: true }));
    await assertFails(set(presenceRef(ALICE, ALICE), { online: 'yes', lastChanged: serverTimestamp() }));
    await assertFails(set(presenceRef(ALICE, ALICE), { online: true, lastChanged: 'now' }));
  });

  it('denies a lastChanged in the future', async () => {
    await assertFails(set(presenceRef(ALICE, ALICE), { online: true, lastChanged: Date.now() + 86_400_000 }));
  });

  it('denies writing a non-object value', async () => {
    await assertFails(set(presenceRef(ALICE, ALICE), 'x'.repeat(1000)));
  });

  it('allows removing your own presence', async () => {
    await assertSucceeds(set(presenceRef(ALICE, ALICE), { online: true, lastChanged: serverTimestamp() }));
    await assertSucceeds(remove(presenceRef(ALICE, ALICE)));
  });

  it('allows updating a single field on existing presence', async () => {
    await assertSucceeds(set(presenceRef(ALICE, ALICE), { online: true, lastChanged: serverTimestamp() }));
    await assertSucceeds(update(presenceRef(ALICE, ALICE), { online: false }));
  });
});
