import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import invariant from 'tiny-invariant';
import {
  getAuthenticatorById,
  getAuthenticators,
  addAuthenticatorToUser,
} from '~/models/authenticator.server.ts';
import { addPasswordToUser, verifyPasswordLogin } from '~/models/password.server.ts';
import { type User, getUserByName, createUserOrThrow, getUserById } from '~/models/user.server.ts';

import { WebAuthnStrategy } from '~/services/webauthn-strategy.server.ts';
import { getSession, sessionStorage } from '~/services/session.server.ts';

export let authenticator = new Authenticator<User>(sessionStorage);

export async function isUsernameAvailable(username: string) {
  const user = await getUserByName(username);
  return !user;
}

// we reuse them to add new passkeys to authenticated users
export const WEBAUTHN_RP_NAME = '8bit Stack';
export const WEBAUTHN_RP_ID =
  process.env.NODE_ENV === 'development' ? 'localhost' : process.env.APP_URL!;
export const WEBAUTHN_ORIGIN =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.PORT ?? 3000}`
    : process.env.APP_URL!;

authenticator.use(
  new WebAuthnStrategy(
    {
      // The human-readable name of your app
      // Type: string | (response:Response) => Promise<string> | string
      rpName: WEBAUTHN_RP_NAME,
      // The hostname of the website, determines where passkeys can be used
      // See https://www.w3.org/TR/webauthn-2/#relying-party-identifier
      // Type: string | (response:Response) => Promise<string> | string
      rpID: WEBAUTHN_RP_ID,
      // Website URL (or array of URLs) where the registration can occur
      origin: WEBAUTHN_ORIGIN,
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
    async ({ authenticator, type, username, userId }) => {
      const savedAuthenticator = await getAuthenticatorById(authenticator.credentialID);
      if (type === 'registration') {
        // Check if the authenticator exists in the database
        if (savedAuthenticator) {
          throw new Error('Authenticator has already been registered.');
        }
        invariant(userId, 'User id is required.');
        invariant(username, 'Username is required.');
        const user = await createUserOrThrow(username, userId);
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
    if (!username) throw new Error('username is required');
    if (!password) throw new Error('password is required');
    invariant(typeof username === 'string', 'username must be a string');
    invariant(typeof password === 'string', 'password must be a string');
    const type = form.get('type');
    if (type === 'registration') {
      const userId = form.get('user-id');
      if (!userId) throw new Error('user id is required');
      invariant(typeof userId === 'string', 'user id must be a string');
      const user = await createUserOrThrow(username, userId);
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

export async function verifyNewAuthenticator(
  responseData: RegistrationResponseJSON,
  expectedChallenge: string,
) {
  const verification = await verifyRegistrationResponse({
    response: responseData as RegistrationResponseJSON,
    expectedChallenge: expectedChallenge ?? '',
    expectedOrigin: WEBAUTHN_ORIGIN,
    expectedRPID: WEBAUTHN_RP_ID,
  });

  if (verification.verified && verification.registrationInfo) {
    const { credentialPublicKey, credentialID, counter, credentialBackedUp, credentialDeviceType } =
      verification.registrationInfo;

    const newAuthenticator = {
      credentialID: Buffer.from(credentialID).toString('base64url'),
      credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      credentialBackedUp: credentialBackedUp ? 1 : 0,
      credentialDeviceType,
      transports: '',
    };
    const savedAuthenticator = await getAuthenticatorById(newAuthenticator.credentialID);
    if (savedAuthenticator) {
      throw new Error('Authenticator has already been registered.');
    }
    return newAuthenticator;
  } else {
    throw new Error('Passkey verification failed.');
  }
}
