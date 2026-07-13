import { test, expect } from '@playwright/test';
import { clearEmulatorData, createEmailUser } from './helpers/emulator';
import { createRoomFromHomePage, loginWithEmail, handleJoinRoleModal } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('authenticated user joining new room sees JoinRoleModal', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Auth Join Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await createEmailUser('joiner@test.com', 'password123', 'Joiner');
  await loginWithEmail(page2, 'joiner@test.com', 'password123');

  await page2.goto(`/room/${roomId}`);
  await handleJoinRoleModal(page2, 'player');

  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page2.getByRole('button', { name: '5' })).toBeVisible({ timeout: 5_000 });
  await expect(page1.locator('tr', { hasText: 'Joiner' })).toBeVisible({ timeout: 10_000 });

  await context1.close();
  await context2.close();
});

test('joining via direct link does not flash removed-from-room message', async ({ browser }) => {
  // Create a room with one player so players.length > 0 in Firestore (required to trigger the bug)
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Direct Link Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  // Second user navigates directly to the room URL (simulates sharing a link)
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await createEmailUser('directjoin@test.com', 'password123', 'DirectJoiner');
  await loginWithEmail(page2, 'directjoin@test.com', 'password123');

  await page2.goto(`/room/${roomId}`);

  // The "removed from room" message must never appear — assert immediately after load
  await expect(page2.getByText('You have been removed from the room')).not.toBeVisible();

  // Normal join flow should proceed: role modal → room UI
  await handleJoinRoleModal(page2, 'player');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  // Confirm the "removed" message never surfaced after the join either
  await expect(page2.getByText('You have been removed from the room')).not.toBeVisible();

  await context1.close();
  await context2.close();
});

test('NewPlayerModal Exit button navigates to home', async ({ page }) => {
  await page.goto('/');
  // Wait for auth to settle (Login link visible = auth loaded, no player)
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

  // Use a 20-char room ID to pass minLength validation; no room with this ID exists
  await page.getByPlaceholder('Room ID or Name').fill('aaaabbbbccccddddeeee');
  await page.getByRole('button', { name: 'Join Room' }).click();

  // Anonymous users see NewPlayerModal (player is null → setShowCreateNewPlayerModal(true))
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: 'Exit' }).click();

  await page.waitForURL('/', { timeout: 5_000 });
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeHidden();
});
