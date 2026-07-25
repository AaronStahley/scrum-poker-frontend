import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, joinRoomFromHomePage } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('presence dot is visible to everyone, not just the host', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Presence Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await joinRoomFromHomePage(page2, roomId, 'Bob');

  // Non-host (Bob) sees a green dot next to the host (Alice)'s name
  const aliceDotOnBob = page2.locator('tr', { hasText: 'Alice' }).locator('span.bg-green-500');
  await expect(aliceDotOnBob).toBeVisible({ timeout: 10_000 });

  // Host (Alice) sees a green dot next to Bob's name too
  const bobDotOnAlice = page1.locator('tr', { hasText: 'Bob' }).locator('span.bg-green-500');
  await expect(bobDotOnAlice).toBeVisible({ timeout: 10_000 });

  await context1.close();
  await context2.close();
});

test('dot tooltip surfaces online status and last-active text', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Tooltip Room', 'Alice');

  const dot = page1.locator('tr', { hasText: 'Alice' }).locator('span.bg-green-500');
  await expect(dot).toBeVisible({ timeout: 10_000 });
  await expect(dot).toHaveAttribute('data-tip', /Online now/);

  await context1.close();
});

test('presence dot flips offline when the other player disconnects', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Disconnect Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await joinRoomFromHomePage(page2, roomId, 'Bob');

  await expect(page1.locator('tr', { hasText: 'Bob' }).locator('span.bg-green-500')).toBeVisible({ timeout: 10_000 });

  // Closing the context kills the tab outright — no beforeunload/cleanup JS runs,
  // mirroring a crash or dropped network rather than a graceful tab close. Only
  // RTDB's server-side onDisconnect() can catch this class of disconnect.
  await context2.close();

  await expect(page1.locator('tr', { hasText: 'Bob' }).locator('span.bg-gray-400')).toBeVisible({ timeout: 15_000 });

  await context1.close();
});

test('presence dot flips offline when the other player navigates away without closing the tab', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Navigate Away Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await joinRoomFromHomePage(page2, roomId, 'Bob');

  await expect(page1.locator('tr', { hasText: 'Bob' }).locator('span.bg-green-500')).toBeVisible({ timeout: 10_000 });

  // Client-side navigation, not a tab close — the Firebase socket stays open,
  // so only an explicit offline write on unmount (not onDisconnect) can catch this.
  await page2.goto('/');

  await expect(page1.locator('tr', { hasText: 'Bob' }).locator('span.bg-gray-400')).toBeVisible({ timeout: 10_000 });

  await context1.close();
  await context2.close();
});
