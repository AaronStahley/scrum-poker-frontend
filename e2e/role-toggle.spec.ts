import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, handleNewPlayerModal } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('player toggles own role to spectator: card selector disappears', async ({ page }) => {
  await createRoomFromHomePage(page, 'Toggle Room', 'Alice');

  await expect(page.locator('tr', { hasText: 'Alice' })).toBeVisible({ timeout: 8_000 });

  await page.locator('tr', { hasText: 'Alice' }).getByTitle('Switch to Spectator').click();

  await expect(page.getByRole('button', { name: '5' })).toBeHidden({ timeout: 8_000 });
  await expect(page.getByRole('button', { name: '8' })).toBeHidden();
  await expect(page.getByText('Spectators')).toBeVisible({ timeout: 5_000 });
});

test('player toggles back to player: card selector reappears', async ({ page }) => {
  await createRoomFromHomePage(page, 'Toggle Room', 'Alice');
  await expect(page.locator('tr', { hasText: 'Alice' })).toBeVisible({ timeout: 8_000 });

  // Toggle to spectator
  await page.locator('tr', { hasText: 'Alice' }).getByTitle('Switch to Spectator').click();
  await expect(page.getByRole('button', { name: '5' })).toBeHidden({ timeout: 8_000 });

  // Expand spectators section to see Alice's row
  await page.locator('tr').filter({ hasText: 'Spectators' }).click();
  await expect(page.locator('tr', { hasText: 'Alice' })).toBeVisible({ timeout: 5_000 });

  // Toggle back to player
  await page.locator('tr', { hasText: 'Alice' }).getByTitle('Switch to Player').click();

  await expect(page.getByRole('button', { name: '5' })).toBeVisible({ timeout: 8_000 });
  await expect(page.getByRole('button', { name: '8' })).toBeVisible();
  await expect(page.getByText('Spectators')).toBeHidden({ timeout: 3_000 });
});

test('host toggles another player to spectator: that player loses card selector', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Host Toggle Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  // Alice (host) toggles Bob to spectator
  await page1.locator('tr', { hasText: 'Bob' }).getByTitle('Switch to Spectator').click();

  await expect(page2.getByRole('button', { name: '5' })).toBeHidden({ timeout: 10_000 });
  await expect(page2.getByRole('button', { name: '8' })).toBeHidden();
  await expect(page1.getByText('Spectators')).toBeVisible({ timeout: 5_000 });

  await context1.close();
  await context2.close();
});
