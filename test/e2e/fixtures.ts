import { test as base } from '@playwright/test';
import { username, password } from './consts.ts';

import { addPasswordToUser, createUser } from '~/models/user.server.ts';
import { resetDB } from 'test/utils.ts';

export const test = base.extend({
  // Extend the base test with a new "login" method.
  pageWithUser: async ({ page }, use) => {
    const user = await createUser(username);
    await addPasswordToUser(user.id, password);
    await use(page);
  },
  loggedInPage: async ({ page }, use) => {
    // TODO: login by setting session cookie directly instead of entering password
    //       to test for users that only uses passkey
    const user = await createUser(username);
    await addPasswordToUser(user.id, password);
    await page.goto('/login/password');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/');
    await use(page);
    // I wanna logout here
  },
});

test.beforeEach(async () => {
  await resetDB();
});

export { expect } from '@playwright/test';
