import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('selecting a card highlights it', async ({ page }) => {
  await createRoomFromHomePage(page, 'Voting Room', 'Alice');

  const cardFive = page.getByRole('button', { name: '5' });
  await cardFive.click();

  await expect(cardFive).toHaveClass(/border-primary/);
});

test('revealing votes shows VoteStatistics panel', async ({ page }) => {
  await createRoomFromHomePage(page, 'Voting Room', 'Alice');

  await page.getByRole('button', { name: '8' }).click();
  // Wait for the 300ms card selection debounce to flush before revealing
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Reveal Votes' }).click();

  await expect(page.getByText('Recommended')).toBeVisible();
  await expect(page.getByText('Range')).toBeVisible();
});

test('resetting votes hides VoteStatistics and deselects cards', async ({ page }) => {
  await createRoomFromHomePage(page, 'Voting Room', 'Alice');

  await page.getByRole('button', { name: '8' }).click();
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Reveal Votes' }).click();
  await expect(page.getByText('Recommended')).toBeVisible();

  await page.getByRole('button', { name: 'Reset Votes' }).click();

  await expect(page.getByText('Recommended')).not.toBeVisible();
  await expect(page.getByRole('button', { name: '8' })).not.toHaveClass(/border-primary/);
});
