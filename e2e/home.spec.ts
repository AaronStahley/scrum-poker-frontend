import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('home page renders title and both forms', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'The Scrum Poker' })).toBeVisible();
  await expect(page.getByPlaceholder('Enter Room Name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Room' })).toBeVisible();
  await expect(page.getByPlaceholder('Room ID or Name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Join Room' })).toBeVisible();
});
