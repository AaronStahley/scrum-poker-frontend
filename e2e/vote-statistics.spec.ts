import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, handleNewPlayerModal } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('single voter produces Unanimous badge and 1 of 1 voted', async ({ page }) => {
  await createRoomFromHomePage(page, 'Stats Room', 'Alice');

  await page.getByRole('button', { name: '8' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Reveal Votes' }).click();

  await expect(page.getByText('Unanimous')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByText('1 of 1 voted')).toBeVisible();
});

test('two voters with range ≤ 2 produce Close badge', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Close Stats', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  await page1.getByRole('button', { name: '5' }).click();
  await page2.getByRole('button', { name: '3', exact: true }).click();
  await page1.waitForTimeout(500);
  await page1.getByRole('button', { name: 'Reveal Votes' }).click();

  await expect(page1.getByText('Close', { exact: true })).toBeVisible({ timeout: 8_000 });
  await expect(page1.getByText('2 of 2 voted')).toBeVisible();
  await expect(page2.getByText('Close', { exact: true })).toBeVisible({ timeout: 8_000 });

  await context1.close();
  await context2.close();
});

test('two voters with range > 2 produce Split badge', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Split Stats', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  await page1.getByRole('button', { name: '1', exact: true }).click();
  await page2.getByRole('button', { name: '8' }).click();
  await page1.waitForTimeout(500);
  await page1.getByRole('button', { name: 'Reveal Votes' }).click();

  await expect(page1.getByText('Split')).toBeVisible({ timeout: 8_000 });
  await expect(page1.getByText('2 of 2 voted')).toBeVisible();

  await context1.close();
  await context2.close();
});

test('"?" vote excluded from numeric stats but shown in table after reveal', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Question Stats', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page1.locator('tr', { hasText: 'Bob' })).toBeVisible({ timeout: 10_000 });

  await page1.getByRole('button', { name: '8' }).click();
  await page2.getByRole('button', { name: '?' }).click();
  await page1.waitForTimeout(500);
  await page1.getByRole('button', { name: 'Reveal Votes' }).click();

  // Only Alice's numeric vote counts; Bob's "?" is excluded
  await expect(page1.getByText('1 of 2 numeric')).toBeVisible({ timeout: 8_000 });
  // Only one numeric voter, so unanimous
  await expect(page1.getByText('Unanimous')).toBeVisible();
  // Bob's "?" appears in his row after reveal
  await expect(page1.locator('tr', { hasText: 'Bob' })).toContainText('?', { timeout: 8_000 });

  await context1.close();
  await context2.close();
});
