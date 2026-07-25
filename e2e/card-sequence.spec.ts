import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, handleNewPlayerModal, openHostSettings } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('room created with T-Shirt Sizes deals t-shirt cards', async ({ page }) => {
  await createRoomFromHomePage(page, 'Shirt Room', 'Alice', 'T-Shirt Sizes');

  await expect(page.getByRole('button', { name: 'XL', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '5', exact: true })).toBeHidden();
});

test('modified fibonacci renders the ½ label in the table after reveal', async ({ page }) => {
  await createRoomFromHomePage(page, 'Half Room', 'Alice', 'Modified Fibonacci');

  await page.getByRole('button', { name: '½', exact: true }).click();
  // Wait for the 300ms card selection debounce to flush before revealing
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Reveal Votes' }).click();

  await expect(page.locator('tr', { hasText: 'Alice' })).toContainText('½');
});

test('settings modal reflects the saved sequence after a reload', async ({ page }) => {
  await createRoomFromHomePage(page, 'Reload Room', 'Alice', 'T-Shirt Sizes');
  await page.reload();
  await expect(page.getByRole('button', { name: 'XL', exact: true })).toBeVisible({ timeout: 15_000 });

  await openHostSettings(page);
  const modal = page.locator('.modal-box').filter({ hasText: 'Card Sequence' });
  await expect(modal.getByRole('radio', { name: /^T-Shirt Sizes/ })).toBeChecked();

  // Switching away from the saved sequence must take effect on the first click.
  // click() rather than check(): the radio is controlled and only flips once the
  // Firestore write resolves, which is too slow for check()'s immediate assertion.
  await modal.getByRole('radio', { name: /^Fibonacci/ }).click();
  await expect(modal.getByRole('radio', { name: /^Fibonacci/ })).toBeChecked();
  await page.getByRole('button', { name: 'Close Settings' }).click();

  await expect(page.getByRole('button', { name: '21', exact: true })).toBeVisible({ timeout: 10_000 });
});

test('host switching sequence swaps the cards and clears votes for everyone', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Switch Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  await page1.getByRole('button', { name: '8', exact: true }).click();
  await page2.getByRole('button', { name: '13', exact: true }).click();
  await page1.waitForTimeout(500);

  await openHostSettings(page1);
  await page1.locator('.modal-box').getByRole('radio', { name: /^T-Shirt Sizes/ }).click();
  await page1.getByRole('button', { name: 'Close Settings' }).click();

  // Both players get the new deck
  await expect(page1.getByRole('button', { name: 'XL', exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page2.getByRole('button', { name: 'XL', exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page2.getByRole('button', { name: '13', exact: true })).toBeHidden();

  // Votes cast on the old sequence are gone rather than lingering as bad data
  await page1.getByRole('button', { name: 'Reveal Votes' }).click();
  await expect(page1.getByText('No votes')).toBeVisible({ timeout: 10_000 });
  await expect(page1.locator('tr', { hasText: 'Alice' })).not.toContainText('8');
  await expect(page1.locator('tr', { hasText: 'Bob' })).not.toContainText('13');

  await context1.close();
  await context2.close();
});
