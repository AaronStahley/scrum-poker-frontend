import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, handleNewPlayerModal } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('spectator does not see the card selector', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Spectator Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob', 'spectator');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  // Card selector is hidden for spectators. toBeHidden() retries until the spectators
  // field syncs via onSnapshot — it's briefly visible before the first Firestore update.
  await expect(page2.getByRole('button', { name: '5' })).toBeHidden();
  await expect(page2.getByRole('button', { name: '8' })).toBeHidden();

  await context1.close();
  await context2.close();
});

test('spectator votes are excluded from statistics', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Spectator Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob', 'spectator');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  // Alice votes; wait for spectator sync before revealing so Bob's role is established
  await expect(page2.getByRole('button', { name: '5' })).toBeHidden();
  await page1.getByRole('button', { name: '8' }).click();
  await page1.waitForTimeout(500);
  await page1.getByRole('button', { name: 'Reveal Votes' }).click();

  // calculateVoteStats excludes spectators: 1 voter (Alice), 1 vote cast
  await expect(page1.getByText('1 of 1 voted')).toBeVisible();

  await context1.close();
  await context2.close();
});
