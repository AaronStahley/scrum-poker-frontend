import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, handleNewPlayerModal, openHostSettings } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('Settings button visible to host, hidden to non-host', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Settings Visibility', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  // Wait for Firestore sync so isHost is fully resolved on both pages
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  await expect(page1.getByTitle('Room Settings')).toBeVisible();
  await expect(page2.getByTitle('Room Settings')).toBeHidden();

  await context1.close();
  await context2.close();
});

test('host renames room and both players see updated name', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Original Name', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  await openHostSettings(page1);
  await page1.getByPlaceholder('Enter room name').fill('Renamed Room');
  await page1.getByRole('button', { name: 'Update Name' }).click();
  await expect(page1.getByRole('heading', { name: 'Room Settings' })).toBeHidden({ timeout: 5_000 });

  await expect(page1.getByText('Renamed Room')).toBeVisible({ timeout: 8_000 });
  await expect(page2.getByText('Renamed Room')).toBeVisible({ timeout: 8_000 });

  await context1.close();
  await context2.close();
});

test('Cancel in delete confirmation modal does not delete the room', async ({ page }) => {
  await createRoomFromHomePage(page, 'Keep This Room', 'Alice');
  const roomUrl = page.url();

  await openHostSettings(page);
  await page.getByRole('button', { name: 'Delete Room' }).click();
  await expect(page.locator('.modal-box').filter({ hasText: 'cannot be undone' })).toBeVisible();
  await page.locator('.modal-box').filter({ hasText: 'cannot be undone' }).getByRole('button', { name: 'Cancel' }).click();

  await expect(page.locator('.modal-box').filter({ hasText: 'cannot be undone' })).toBeHidden({ timeout: 3_000 });
  await expect(page).toHaveURL(roomUrl);
});

test('switching to All Players permissions shows remove button for non-host', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Perms Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  // Initially "Host Only" — remove button title reflects this
  await expect(page1.locator('tr', { hasText: 'Bob' }).getByTitle('Remove player (Host only)')).toBeVisible();

  await openHostSettings(page1);
  await page1.getByText('All Players', { exact: true }).click();
  await page1.getByRole('button', { name: 'Close Settings' }).click();

  // After switching, the title changes to "Remove player" (no "(Host only)")
  await expect(page1.locator('tr', { hasText: 'Bob' }).getByTitle('Remove player')).toBeVisible({ timeout: 8_000 });
  await expect(page1.locator('tr', { hasText: 'Bob' }).getByTitle('Remove player (Host only)')).toBeHidden();

  await context1.close();
  await context2.close();
});

test('host deletes room: host redirected to /, non-host sees alert and is redirected', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Doomed Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  await openHostSettings(page1);
  await page1.getByRole('button', { name: 'Delete Room' }).click();
  await page1.locator('.modal-box').filter({ hasText: 'cannot be undone' }).getByRole('button', { name: 'Delete Room' }).click();

  await page1.waitForURL('/', { timeout: 10_000 });
  await expect(page2.getByText('Room has been deleted')).toBeVisible({ timeout: 10_000 });
  await page2.waitForURL('/?message=room-deleted', { timeout: 8_000 });

  await context1.close();
  await context2.close();
});
