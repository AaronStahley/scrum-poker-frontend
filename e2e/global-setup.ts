// Warms up the Firebase emulator's JVM before any tests run.
// The first browser WebChannel connection to the Firestore emulator triggers JIT
// compilation, which takes 20-30s and causes the first test to time out.
// This setup runs a real create-room flow to pre-compile those hot paths.
// webServer starts before globalSetup in Playwright 1.22+, so BASE_URL is available.
import { chromium } from '@playwright/test';
import { clearEmulatorData } from './helpers/emulator';
import { createRoomFromHomePage } from './helpers/page-actions';
import { BASE_URL } from './config';

export default async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  // Set baseURL so page.goto('/') works inside helpers, and extend timeouts for cold JVM start.
  const context = await browser.newContext({ baseURL: BASE_URL });
  context.setDefaultTimeout(60_000);
  const page = await context.newPage();

  try {
    // Trigger the full create-room + anonymous sign-in + Firestore write flow.
    // This pre-compiles the WebChannel, auth, and Firestore code paths in the JVM.
    await createRoomFromHomePage(page, 'warmup-room', 'warmup-user');
  } catch (e) {
    // Best-effort — tests still have retries as a safety net.
    // If this fails, the most likely cause is the emulator not running.
    console.warn(
      'Emulator warmup failed — cold JVM start may cause the first test to be slow:',
      e instanceof Error ? e.message : e
    );
  } finally {
    await context.close();
    await browser.close();
    // Leave the emulator clean for the first beforeEach to handle.
    await clearEmulatorData().catch(() => {});
  }
}
