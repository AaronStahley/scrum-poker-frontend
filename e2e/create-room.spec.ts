import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('anonymous user creates a room and lands on room page', async ({ page }) => {
  await createRoomFromHomePage(page, 'Sprint 42', 'Alice');
  await expect(page.getByText('Sprint 42')).toBeVisible();
  await expect(page.getByText(/Room Id:/)).toBeVisible();
});

test('card selector is visible after creating a room', async ({ page }) => {
  await createRoomFromHomePage(page, 'Sprint 42', 'Alice');
  await expect(page.getByRole('button', { name: '5' })).toBeVisible();
  await expect(page.getByRole('button', { name: '?' })).toBeVisible();
});
