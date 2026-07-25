import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, handleNewPlayerModal } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('removed player is redirected to home', async ({ browser }) => {
  // Alice creates the room. addPlayerToRoom promotes the first non-anonymous joiner
  // to host (sets createdBy = playerId when it was "anonymous"), so Alice is host.
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Removal Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  // Bob joins the room directly
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  // Wait for Bob to appear in Alice's PlayerTable (1s skeleton + Firestore sync)
  const bobRow = page1.locator('tr', { hasText: 'Bob' });
  await expect(bobRow).toBeVisible({ timeout: 10_000 });

  // Alice removes Bob via the trash button in his row
  await bobRow.getByTitle('Remove player (Host only)').click();

  // RoomClient detects the removal via onSnapshot and redirects after 1500ms
  await page2.waitForURL(/\?message=player-removed/, { timeout: 10_000 });

  await context1.close();
  await context2.close();
});
