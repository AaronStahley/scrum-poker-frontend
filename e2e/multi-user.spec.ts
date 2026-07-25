import { test, expect } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage, joinRoomFromHomePage, handleNewPlayerModal } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('two players join the same room and see each other', async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Team Room', 'Alice');

  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await joinRoomFromHomePage(page2, roomId, 'Bob');

  await expect(page1.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  // Alice's page should show Bob once his onSnapshot fires
  await expect(page1.getByText('Bob')).toBeVisible({ timeout: 8_000 });

  await context1.close();
  await context2.close();
});

test("player B sees player A's vote hidden then revealed", async ({ browser }) => {
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  await createRoomFromHomePage(page1, 'Visibility Room', 'Alice');
  const roomId = page1.url().split('/room/')[1];

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto(`/room/${roomId}`);
  await handleNewPlayerModal(page2, 'Bob');
  await expect(page2.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();

  // Wait for Alice's name to appear in Bob's PlayerTable (1s skeleton + Firestore sync)
  const aliceRowOnBob = page2.locator('tr', { hasText: 'Alice' });
  await expect(aliceRowOnBob).toBeVisible({ timeout: 10_000 });

  // Alice selects a card; wait for the 300ms debounce to flush to Firestore
  await page1.getByRole('button', { name: '8' }).click();
  await page1.waitForTimeout(500);

  // Before reveal: Bob sees Alice voted (lock icon in her row) but not the value
  await expect(aliceRowOnBob).not.toContainText('8');

  // Alice reveals votes
  await page1.getByRole('button', { name: 'Reveal Votes' }).click();

  // After reveal: Bob's view updates via onSnapshot and shows Alice's actual vote
  await expect(aliceRowOnBob).toContainText('8', { timeout: 8_000 });

  await context1.close();
  await context2.close();
});
