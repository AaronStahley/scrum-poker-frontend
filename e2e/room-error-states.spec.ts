import { test, expect } from '@playwright/test';
import { clearEmulatorData, createEmailUser } from './helpers/emulator';
import { createRoomFromHomePage, loginWithEmail, openHostSettings } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('navigating to a non-existent room shows RoomNotFound and redirects to home', async ({ page }) => {
  await page.goto('/room/aaaabbbbccccddddeeee');
  await expect(page.getByText('Room not found. Redirecting...')).toBeVisible({ timeout: 10_000 });
  await page.waitForURL('/', { timeout: 6_000 });
});

test('room deleted while non-host is inside shows alert then redirects', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Delete Test', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await page2.getByPlaceholder('Enter your name').fill('Bob');
  await page2.getByRole('button', { name: 'Join as Player' }).click();
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

test('joining a non-existent room via home form shows inline error alert', async ({ page }) => {
  await createEmailUser('joinerror@test.com', 'password123', 'JoinError');
  await loginWithEmail(page, 'joinerror@test.com', 'password123');

  await page.getByPlaceholder('Room ID or Name').fill('aaaabbbbccccddddeeee');
  await page.getByRole('button', { name: 'Join Room' }).click();

  const errorAlert = page.getByRole('alert').filter({ hasText: 'Room not found' });
  await expect(errorAlert).toBeVisible({ timeout: 8_000 });
  await expect(page).toHaveURL('/');
});
