// Warms up the Firebase emulator's JVM before any tests run.
// The first browser WebChannel connection to the Firestore emulator triggers JIT
// compilation, which takes 20-30s and causes the first test to time out.
// This setup runs a real create-room flow to pre-compile those hot paths.
// webServer starts before globalSetup in Playwright 1.22+, so http://localhost:3001 is available.
import { chromium } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';

const BASE_URL = 'http://localhost:3001';

export default async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Trigger the full create-room + anonymous sign-in + Firestore write flow.
    // This pre-compiles the WebChannel, auth, and Firestore code paths in the JVM.
    await page.goto(BASE_URL);
    await page.getByPlaceholder('Enter Room Name').fill('warmup-room');
    await page.getByRole('button', { name: 'Create Room' }).click();
    await page.getByPlaceholder('Enter your name').fill('warmup-user');
    await page.getByRole('button', { name: 'Join as Player' }).click();
    await page.waitForURL(/\/room\/.+/, { timeout: 60_000 });
  } catch {
    // Best-effort — tests still have retries as a safety net.
  } finally {
    await context.close();
    await browser.close();
    // Leave the emulator clean for the first beforeEach to handle.
    await clearEmulatorData().catch(() => {});
  }
}
