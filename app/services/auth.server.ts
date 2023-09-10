import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { WebAuthnStrategy } from 'remix-auth-webauthn';
import invariant from 'tiny-invariant';
import { getAuthenticatorById, getAuthenticators } from '~/models/authenticator.server.ts';
import {
  type User,
  verifyPasswordLogin,
  getUserByName,
  createUser,
  addAuthenticatorToUser,
  getUserById,
  addPasswordToUser,
} from '~/models/user.server.ts';

import { getSession, sessionStorage } from '~/services/session.server.ts';

export let authenticator = new Authenticator<User>(sessionStorage);

type VerificationType = 'registration' | 'authentication';

export async function isUsernameAvailable(username: string) {
  const user = await getUserByName(username);
  return !user;
}

async function createUserIfNameAvailable(username: string) {
  if (!(await isUsernameAvailable(username))) {
    throw new Error('Username already taken');
  }
  return createUser(username);
}

authenticator.use(
  new WebAuthnStrategy(
    {
      // The human-readable name of your app
      // Type: string | (response:Response) => Promise<string> | string
      rpName: '8bit Stack',
      // The hostname of the website, determines where passkeys can be used
      // See https://www.w3.org/TR/webauthn-2/#relying-party-identifier
      // Type: string | (response:Response) => Promise<string> | string
      rpID: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.APP_URL!,
      // Website URL (or array of URLs) where the registration can occur
      origin:
        process.env.NODE_ENV === 'development'
          ? `http://localhost:${process.env.PORT ?? 3000}`
          : process.env.APP_URL!,
      // Return the list of authenticators associated with this user. You might
      // need to transform a CSV string into a list of strings at this step.
      getUserAuthenticators: async (user) => {
        if (!user) return [];
        return await getAuthenticators(user);
      },
      // Transform the user object into the shape expected by the strategy.
      // You can use a regular username, the users email address, or something else.
      getUserDetails: (user) => ({ id: user!.id, username: user!.name }),
      getUserByUsername: (username) => getUserByName(username),
      getAuthenticatorById,
    },
    async ({ authenticator, type, username }) => {
      const savedAuthenticator = await getAuthenticatorById(authenticator.credentialID);
      if (type === 'registration') {
        // Check if the authenticator exists in the database
        invariant(!savedAuthenticator, 'Authenticator has already been registered.');
        // Username is null for authentication verification,
        // but required for registration verification.
        // It is unlikely this error will ever be thrown,
        // but it helps with the TypeScript checking
        invariant(username, 'Username is required.');
        const user = await createUserIfNameAvailable(username);
        await addAuthenticatorToUser(user.id, authenticator);
        return user;
      } else if (type === 'authentication') {
        if (!savedAuthenticator) throw new Error('Authenticator not found');
        const user = await getUserById(savedAuthenticator.userId);
        if (!user) throw new Error('User not found');
        return user;
      } else {
        throw new Error('Invalid verification type');
      }
    },
  ),
  'webauthn',
);

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get('username');
    const password = form.get('password');
    if (!username || !password) {
      throw new Error('username and password are required');
    }
    invariant(typeof username === 'string', 'username must be a string');
    invariant(typeof password === 'string', 'password must be a string');
    const type = form.get('type');
    if (!type) {
      throw new Error('type is required');
    }
    invariant(typeof type === 'string', 'type must be a string');
    if (type === 'registration') {
      const user = await createUserIfNameAvailable(username);
      await addPasswordToUser(user.id, password);
      return user;
    } else if (type === 'authentication') {
      const user = await verifyPasswordLogin(username, password);
      return user;
    } else {
      throw new Error('Invalid type');
    }
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
