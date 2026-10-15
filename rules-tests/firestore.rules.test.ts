// Firestore security rules tests. Run with `npm run test:rules`, which starts
// the Firestore emulator under a demo project and runs this suite against it.
//
// Each "allows" case mirrors a write the app actually makes (see
// src/lib/firebase/room.ts and player.ts); each "denies" case is something a
// client could attempt by calling the Firestore API directly.
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  where,
} from 'firebase/firestore';

const HOST = 'host-uid';
const ALICE = 'alice-uid';
const BOB = 'bob-uid';
const OUTSIDER = 'outsider-uid';
const ROOM = 'room-1';

let env: RulesTestEnvironment;

const db = (uid?: string) =>
  uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore();

const roomRef = (uid?: string, roomId = ROOM) => doc(db(uid), 'rooms', roomId);
const playerRef = (uid: string | undefined, playerId: string) => doc(db(uid), 'players', playerId);

// Seeds data with rules disabled, the way the app would have left it.
async function seed(data: {
  room?: Record<string, unknown>;
  players?: Record<string, Record<string, unknown>>;
}) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const admin = ctx.firestore();
    if (data.room) {
      await setDoc(doc(admin, 'rooms', ROOM), data.room);
    }
    for (const [id, player] of Object.entries(data.players ?? {})) {
      await setDoc(doc(admin, 'players', id), player);
    }
  });
}

const baseRoom = (overrides: Record<string, unknown> = {}) => ({
  createdAt: new Date(),
  createdBy: HOST,
  name: 'Sprint 42',
  status: 'waiting',
  players: [HOST, ALICE, BOB],
  spectators: [],
  playerRemovalPermissions: 'host-only',
  cardSequence: 'fibonacci',
  lastActivity: new Date(),
  ...overrides,
});

const basePlayer = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  name: id,
  selection: 5,
  currentRoom: ROOM,
  createdAt: new Date(),
  lastJoinedAt: new Date(),
  ...overrides,
});

beforeAll(async () => {
  // Every expected denial is otherwise logged as a warning
  setLogLevel('error');
  env = await initializeTestEnvironment({
    projectId: 'demo-scrum-poker-rules',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8'),
    },
  });
});

afterAll(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('rooms: read', () => {
  beforeEach(() => seed({ room: baseRoom() }));

  it('lets any signed-in user open a room by ID (invite links)', async () => {
    await assertSucceeds(getDoc(roomRef(OUTSIDER)));
  });

  it('allows signed-out reads by ID (server-rendered room page)', async () => {
    await assertSucceeds(getDoc(roomRef()));
  });

  it('denies signed-out listing', async () => {
    await assertFails(getDocs(collection(db(), 'rooms')));
  });

  it('allows the previous-rooms query for your own rooms', async () => {
    const q = query(collectionGroup(db(ALICE), 'rooms'), where('players', 'array-contains', ALICE));
    await assertSucceeds(getDocs(q));
  });

  it('denies listing every room', async () => {
    await assertFails(getDocs(collection(db(ALICE), 'rooms')));
  });

  it('denies querying rooms that belong to someone else', async () => {
    const q = query(collectionGroup(db(OUTSIDER), 'rooms'), where('players', 'array-contains', ALICE));
    await assertFails(getDocs(q));
  });
});

describe('rooms: create', () => {
  const newRoom = (uid: string, overrides: Record<string, unknown> = {}) => ({
    createdAt: new Date(),
    createdBy: uid,
    name: 'New room',
    status: 'waiting',
    players: [uid],
    playerRemovalPermissions: 'host-only',
    cardSequence: 'fibonacci',
    lastActivity: serverTimestamp(),
    ...overrides,
  });

  it('allows creating a room you host (createRoom)', async () => {
    await assertSucceeds(addDoc(collection(db(ALICE), 'rooms'), newRoom(ALICE)));
  });

  it('allows a signed-out visitor to create a placeholder "anonymous" room', async () => {
    await assertSucceeds(addDoc(collection(db(), 'rooms'), newRoom('anonymous')));
  });

  it('denies a signed-out visitor naming a real owner or players', async () => {
    const rooms = collection(db(), 'rooms');
    await assertFails(addDoc(rooms, newRoom(ALICE)));
    await assertFails(addDoc(rooms, newRoom('anonymous', { players: ['anonymous', ALICE] })));
  });

  it('denies a signed-out visitor creating an invalid room', async () => {
    await assertFails(addDoc(collection(db(), 'rooms'), newRoom('anonymous', { status: 'revealed' })));
  });

  it('denies creating a room hosted by someone else', async () => {
    await assertFails(addDoc(collection(db(ALICE), 'rooms'), newRoom(ALICE, { createdBy: BOB })));
  });

  it('denies seeding other players into a new room', async () => {
    await assertFails(addDoc(collection(db(ALICE), 'rooms'), newRoom(ALICE, { players: [ALICE, BOB] })));
  });

  it('denies unknown fields and invalid values', async () => {
    const rooms = collection(db(ALICE), 'rooms');
    await assertFails(addDoc(rooms, newRoom(ALICE, { isAdmin: true })));
    await assertFails(addDoc(rooms, newRoom(ALICE, { name: 'x'.repeat(51) })));
    await assertFails(addDoc(rooms, newRoom(ALICE, { cardSequence: 'powers-of-two' })));
    await assertFails(addDoc(rooms, newRoom(ALICE, { status: 'revealed' })));
  });
});

describe('rooms: join', () => {
  beforeEach(() => seed({ room: baseRoom({ players: [HOST] }) }));

  it('allows joining as a player (addPlayerToRoom)', async () => {
    await assertSucceeds(updateDoc(roomRef(ALICE), {
      createdBy: HOST,
      players: arrayUnion(ALICE),
      lastActivity: serverTimestamp(),
    }));
  });

  it('allows joining as a spectator', async () => {
    await assertSucceeds(updateDoc(roomRef(ALICE), {
      players: arrayUnion(ALICE),
      spectators: arrayUnion(ALICE),
      lastActivity: serverTimestamp(),
    }));
  });

  it('allows the first joiner to claim a legacy "anonymous" room', async () => {
    await seed({ room: baseRoom({ createdBy: 'anonymous', players: ['anonymous'] }) });
    await assertSucceeds(updateDoc(roomRef(ALICE), {
      createdBy: ALICE,
      players: arrayUnion(ALICE),
      lastActivity: serverTimestamp(),
    }));
  });

  it('denies adding someone else to the room', async () => {
    await assertFails(updateDoc(roomRef(ALICE), { players: arrayUnion(BOB) }));
  });

  it('denies taking over host while joining', async () => {
    await assertFails(updateDoc(roomRef(ALICE), { createdBy: ALICE, players: arrayUnion(ALICE) }));
  });

  it('denies wiping the player list while joining', async () => {
    await assertFails(updateDoc(roomRef(ALICE), { players: [ALICE] }));
  });

  it('denies a non-member changing anything else', async () => {
    await assertFails(updateDoc(roomRef(OUTSIDER), { status: 'revealed' }));
    await assertFails(updateDoc(roomRef(OUTSIDER), { lastActivity: serverTimestamp() }));
  });
});

describe('rooms: member actions', () => {
  beforeEach(() => seed({ room: baseRoom() }));

  it('allows members to stamp lastActivity (touchRoom)', async () => {
    await assertSucceeds(updateDoc(roomRef(ALICE), { lastActivity: serverTimestamp() }));
  });

  it('denies a client-chosen lastActivity', async () => {
    await assertFails(updateDoc(roomRef(ALICE), { lastActivity: new Date('2099-01-01') }));
  });

  it('allows members to reveal and reset votes', async () => {
    await assertSucceeds(updateDoc(roomRef(ALICE), { status: 'revealed' }));
    await assertSucceeds(updateDoc(roomRef(ALICE), { status: 'waiting' }));
  });

  it('denies unknown statuses', async () => {
    await assertFails(updateDoc(roomRef(ALICE), { status: 'closed' }));
  });

  it('allows a player to toggle their own role (togglePlayerRole)', async () => {
    await assertSucceeds(updateDoc(roomRef(ALICE), {
      spectators: arrayUnion(ALICE),
      lastActivity: serverTimestamp(),
    }));
  });

  it('allows the host to toggle another player', async () => {
    await assertSucceeds(updateDoc(roomRef(HOST), { spectators: arrayUnion(BOB) }));
  });

  it('denies a non-host toggling another player', async () => {
    await assertFails(updateDoc(roomRef(ALICE), { spectators: arrayUnion(BOB) }));
  });

  it('denies making a non-member a spectator', async () => {
    await assertFails(updateDoc(roomRef(HOST), { spectators: arrayUnion(OUTSIDER) }));
  });

  it('denies members changing host settings', async () => {
    await assertFails(updateDoc(roomRef(ALICE), { name: 'Hijacked' }));
    await assertFails(updateDoc(roomRef(ALICE), { playerRemovalPermissions: 'all-players' }));
    await assertFails(updateDoc(roomRef(ALICE), { cardSequence: 't-shirt' }));
    await assertFails(updateDoc(roomRef(ALICE), { createdBy: ALICE }));
  });
});

describe('rooms: host actions', () => {
  beforeEach(() => seed({ room: baseRoom() }));

  it('allows the host to change room settings', async () => {
    await assertSucceeds(updateDoc(roomRef(HOST), { name: 'Renamed', lastActivity: serverTimestamp() }));
    await assertSucceeds(updateDoc(roomRef(HOST), { playerRemovalPermissions: 'all-players' }));
    await assertSucceeds(updateDoc(roomRef(HOST), { cardSequence: 't-shirt' }));
  });

  it('denies invalid settings even from the host', async () => {
    await assertFails(updateDoc(roomRef(HOST), { name: '' }));
    await assertFails(updateDoc(roomRef(HOST), { cardSequence: 'nope' }));
    await assertFails(updateDoc(roomRef(HOST), { createdBy: ALICE }));
  });

  it('allows the host to delete the room', async () => {
    await assertSucceeds(deleteDoc(roomRef(HOST)));
  });

  it('denies anyone else deleting the room', async () => {
    await assertFails(deleteDoc(roomRef(ALICE)));
    await assertFails(deleteDoc(roomRef(OUTSIDER)));
  });
});

describe('rooms: removing players', () => {
  const removal = (target: string, players: string[]) => ({
    players: players.filter((p) => p !== target),
    spectators: arrayRemove(target),
    lastActivity: serverTimestamp(),
  });
  const allPlayers = [HOST, ALICE, BOB];

  it('allows the host to remove a player (removePlayerFromRoom)', async () => {
    await seed({ room: baseRoom() });
    await assertSucceeds(updateDoc(roomRef(HOST), removal(BOB, allPlayers)));
  });

  it('removes a spectator from both lists', async () => {
    await seed({ room: baseRoom({ spectators: [BOB] }) });
    await assertSucceeds(updateDoc(roomRef(HOST), removal(BOB, allPlayers)));
  });

  it('denies a member removing players in a host-only room', async () => {
    await seed({ room: baseRoom() });
    await assertFails(updateDoc(roomRef(ALICE), removal(BOB, allPlayers)));
  });

  it('allows a member to remove players when the room allows it', async () => {
    await seed({ room: baseRoom({ playerRemovalPermissions: 'all-players' }) });
    await assertSucceeds(updateDoc(roomRef(ALICE), removal(BOB, allPlayers)));
  });

  it('denies removing the host', async () => {
    await seed({ room: baseRoom({ playerRemovalPermissions: 'all-players' }) });
    await assertFails(updateDoc(roomRef(ALICE), removal(HOST, allPlayers)));
  });

  it('denies removing more than one player at once', async () => {
    await seed({ room: baseRoom() });
    await assertFails(updateDoc(roomRef(HOST), { players: [HOST] }));
  });

  it('denies an outsider removing players', async () => {
    await seed({ room: baseRoom({ playerRemovalPermissions: 'all-players' }) });
    await assertFails(updateDoc(roomRef(OUTSIDER), removal(BOB, allPlayers)));
  });
});

describe('players', () => {
  beforeEach(() => seed({
    room: baseRoom(),
    players: {
      [ALICE]: basePlayer(ALICE),
      [BOB]: basePlayer(BOB),
      [OUTSIDER]: basePlayer(OUTSIDER, { currentRoom: 'other-room' }),
    },
  }));

  it('lets signed-in users read players', async () => {
    await assertSucceeds(getDoc(playerRef(ALICE, BOB)));
    await assertFails(getDoc(playerRef(undefined, BOB)));
  });

  it('allows the players-in-room query', async () => {
    const q = query(
      collection(db(ALICE), 'players'),
      where('__name__', 'in', [ALICE, BOB]),
      where('currentRoom', '==', ROOM),
    );
    await assertSucceeds(getDocs(q));
  });

  it('allows creating your own player doc (createPlayer)', async () => {
    await assertSucceeds(setDoc(playerRef(HOST, HOST), {
      id: HOST, name: 'Host', currentRoom: null, selection: null, createdAt: new Date(),
    }));
  });

  it('allows a first write via setDoc merge (updatePlayerDisplayName)', async () => {
    await assertSucceeds(setDoc(playerRef(HOST, HOST), { name: 'Host' }, { merge: true }));
  });

  it("denies creating someone else's player doc", async () => {
    await assertFails(setDoc(playerRef(ALICE, HOST), { id: HOST, name: 'Imposter' }));
  });

  it('allows updating your own selection, room and preferences', async () => {
    await assertSucceeds(updateDoc(playerRef(ALICE, ALICE), { selection: 8 }));
    await assertSucceeds(updateDoc(playerRef(ALICE, ALICE), { selection: '?' }));
    await assertSucceeds(updateDoc(playerRef(ALICE, ALICE), { currentRoom: ROOM, lastJoinedAt: new Date() }));
    await assertSucceeds(setDoc(playerRef(ALICE, ALICE), { preferences: { themeMode: 'dark' } }, { merge: true }));
  });

  it('denies invalid fields on your own doc', async () => {
    await assertFails(updateDoc(playerRef(ALICE, ALICE), { name: 'x'.repeat(51) }));
    await assertFails(updateDoc(playerRef(ALICE, ALICE), { role: 'admin' }));
    await assertFails(updateDoc(playerRef(ALICE, ALICE), { id: BOB }));
  });

  it("allows a roommate to clear another player's card (updatePlayers reset)", async () => {
    await assertSucceeds(updateDoc(playerRef(ALICE, BOB), { selection: null }));
  });

  it("denies setting another player's card", async () => {
    await assertFails(updateDoc(playerRef(ALICE, BOB), { selection: 13 }));
  });

  it("denies changing any other field on another player's doc", async () => {
    await assertFails(updateDoc(playerRef(ALICE, BOB), { name: 'Renamed' }));
    await assertFails(updateDoc(playerRef(ALICE, BOB), { selection: null, currentRoom: null }));
  });

  it("denies clearing the card of a player in a different room", async () => {
    await assertFails(updateDoc(playerRef(ALICE, OUTSIDER), { selection: null }));
  });

  it('denies deleting player docs', async () => {
    await assertFails(deleteDoc(playerRef(ALICE, ALICE)));
  });
});

describe('everything else', () => {
  it('denies access to unknown collections', async () => {
    await assertFails(setDoc(doc(db(ALICE), 'admin', 'config'), { open: true }));
    await assertFails(getDoc(doc(db(ALICE), 'admin', 'config')));
  });
});
