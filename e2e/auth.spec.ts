import { test, expect } from '@playwright/test';
import { clearEmulatorData, createEmailUser } from './helpers/emulator';
import { loginWithEmail } from './helpers/page-actions';

test.beforeEach(async () => {
  await clearEmulatorData();
});

test('anonymous user visiting /settings is redirected to /login', async ({ page }) => {
  await page.goto('/settings');
  await page.waitForURL('/login', { timeout: 10_000 });
});

test('successful email login navigates home and shows avatar', async ({ page }) => {
  await createEmailUser('logintest@test.com', 'password123', 'LoginUser');
  await loginWithEmail(page, 'logintest@test.com', 'password123');

  await expect(page.getByRole('link', { name: 'Login' })).toBeHidden();
  await expect(page.locator('[role="button"].btn-primary.btn-circle')).toBeVisible();
});

test('wrong password on login page shows error message', async ({ page }) => {
  await createEmailUser('wrongpass@test.com', 'correctpass', 'WrongPassUser');
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill('wrongpass@test.com');
  await page.getByPlaceholder('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page.getByText('The current password is incorrect.')).toBeVisible({ timeout: 8_000 });
  await expect(page).toHaveURL('/login');
});

test('logout replaces avatar with Login link', async ({ page }) => {
  await createEmailUser('logouttest@test.com', 'password123', 'LogoutUser');
  await loginWithEmail(page, 'logouttest@test.com', 'password123');

  await page.locator('[role="button"].btn-primary.btn-circle').click();
  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('[role="button"].btn-primary.btn-circle')).toBeHidden();
});

test('new user signup creates account and navigates home', async ({ page }) => {
  await page.goto('/signup');
  await page.getByPlaceholder('Display Name').fill('NewUser');
  await page.getByPlaceholder('Email').fill('newuser@test.com');
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign Up' }).click();

  await page.waitForURL('/', { timeout: 15_000 });
  await expect(page.locator('[role="button"].btn-primary.btn-circle')).toBeVisible();
});
