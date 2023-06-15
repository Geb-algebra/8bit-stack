import { test, expect } from './fixtures.ts';
import { username, password } from './consts.ts';

test.describe('signup', () => {
  test('signup', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText(RegExp(`logged in as ${username}`, 'i'))).toBeVisible();
  });
  test('signup with existing username', async ({ pageWithUser }) => {
    await pageWithUser.goto('/signup');
    await pageWithUser.getByLabel(/username/i).fill(username);
    await pageWithUser.getByLabel(/password/i).fill(password);
    await pageWithUser.getByRole('button', { name: /sign up/i }).click();
    await expect(pageWithUser).toHaveURL('/signup');
    await expect(pageWithUser.getByText(/username already taken/i)).toBeVisible();
  });
});

test.describe('login', () => {
  test('login', async ({ pageWithUser }) => {
    await pageWithUser.goto('/login');
    await pageWithUser.getByLabel(/username/i).fill(username);
    await pageWithUser.getByLabel(/password/i).fill(password);
    await pageWithUser.getByRole('button', { name: /log in/i }).click();
    await expect(pageWithUser).toHaveURL('/');
    await expect(pageWithUser.getByText(RegExp(`logged in as ${username}`, 'i'))).toBeVisible();
  });
  test('login with wrong password', async ({ pageWithUser }) => {
    await pageWithUser.goto('/login');
    await pageWithUser.getByLabel(/username/i).fill(username);
    await pageWithUser.getByLabel(/password/i).fill('wrong password');
    await pageWithUser.getByRole('button', { name: /log in/i }).click();
    await expect(pageWithUser).toHaveURL('/login');
    await expect(pageWithUser.getByText(/invalid username or password/i)).toBeVisible();
  });
  test('login with wrong username', async ({ pageWithUser }) => {
    await pageWithUser.goto('/login');
    await pageWithUser.getByLabel(/username/i).fill('wrong username');
    await pageWithUser.getByLabel(/password/i).fill(password);
    await pageWithUser.getByRole('button', { name: /log in/i }).click();
    await expect(pageWithUser).toHaveURL('/login');
    await expect(pageWithUser.getByText(/invalid username or password/i)).toBeVisible();
  });
  test('redirect to index if already logged in', async ({ loggedInPage }) => {
    await loggedInPage.goto('/login');
    await expect(loggedInPage).toHaveURL('/');
  });
  test('redirect to login page if not logged in', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});
