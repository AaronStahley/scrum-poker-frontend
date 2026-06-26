import { type Page, expect } from '@playwright/test';

export async function loginWithEmail(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.waitForURL('/', { timeout: 15_000 });
}

export async function openHostSettings(page: Page): Promise<void> {
  await page.getByTitle('Room Settings').click();
  await expect(page.getByRole('heading', { name: 'Room Settings' })).toBeVisible();
}

export async function handleJoinRoleModal(
  page: Page,
  role: 'player' | 'spectator' = 'player'
): Promise<void> {
  await expect(page.getByRole('heading', { name: 'How would you like to join?' })).toBeVisible();
  const buttonLabel = role === 'spectator' ? 'Join as Spectator' : 'Join as Player';
  await page.getByRole('button', { name: buttonLabel }).click();
}

export async function handleNewPlayerModal(
  page: Page,
  name: string,
  role: 'player' | 'spectator' = 'player'
): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible();
  await page.getByPlaceholder('Enter your name').fill(name);
  const buttonLabel = role === 'spectator' ? 'Join as Spectator' : 'Join as Player';
  await page.getByRole('button', { name: buttonLabel }).click();
}

export async function createRoomFromHomePage(
  page: Page,
  roomName: string,
  playerName: string
): Promise<void> {
  await page.goto('/');
  await page.getByPlaceholder('Enter Room Name').fill(roomName);
  await page.getByRole('button', { name: 'Create Room' }).click();
  await handleNewPlayerModal(page, playerName);
  await page.waitForURL(/\/room\/.+/);
  await expect(page.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
}

export async function joinRoomFromHomePage(
  page: Page,
  roomId: string,
  playerName: string
): Promise<void> {
  await page.goto('/');
  // Wait for auth to finish loading before filling the form. JoinRoomForm has a
  // useEffect([playerLoading, player]) that calls setRoomId("") when auth state
  // settles — if we fill before that fires, the value gets cleared and the form
  // submits empty. The "Login" link appears once loading=false and player=null.
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  await page.getByPlaceholder('Room ID or Name').fill(roomId);
  await page.getByRole('button', { name: 'Join Room' }).click();
  await handleNewPlayerModal(page, playerName);
  await page.waitForURL(/\/room\/.+/);
  await expect(page.getByRole('heading', { name: 'Select Your Story Point' })).toBeVisible();
}
