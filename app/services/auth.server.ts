import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { type User, verifyLogin, createUser } from '~/models/user.server';

import { getSession, sessionStorage } from '~/services/session.server';

type UserWithoutPassword = {
  id: User['id'];
  name: User['name'];
  createdAt: User['createdAt'];
  updatedAt: User['updatedAt'];
};

export let authenticator = new Authenticator<UserWithoutPassword>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get('username') as string;
    const password = form.get('password') as string;
    const requestFrom = form.get('requestFrom');
    if (requestFrom === 'signup') {
      await createUser(username, password);
    }
    const user = await verifyLogin(username, password);
    if (user === null) {
      if (requestFrom === 'signup') {
        throw new Error('Failed to create user');
      } else if (requestFrom === 'login') {
        throw new Error('Invalid username or password');
      } else {
        throw new Error('You are not logged in');
      }
    }
    return user;
  }),
  'user-pass',
);

export async function getAuthErrorMessage(request: Request) {
  const session = await getSession(request);
  const error = session.get(authenticator.sessionErrorKey);
  if (error) {
    return error.message;
  }
}
