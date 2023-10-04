import type { Authenticator, User } from '@prisma/client';

import { prisma } from '~/db.server.ts';
export type { Authenticator };

export type TransportsSplitAuthenticator = Omit<Authenticator, 'transports'> & {
  transports: Authenticator['transports'][];
};

export async function getAuthenticators(user: User): Promise<TransportsSplitAuthenticator[]> {
  const authenticators = await prisma.authenticator.findMany({
    where: { userId: user.id },
  });
  return authenticators.map((authenticator) => ({
    ...authenticator,
    transports: authenticator.transports.split(','),
  }));
}

export async function getAuthenticatorById(id: Authenticator['credentialID']) {
  return await prisma.authenticator.findUnique({ where: { credentialID: id } });
}

export async function renameAuthenticator(id: Authenticator['credentialID'], newName: string) {
  return await prisma.authenticator.update({
    where: { credentialID: id },
    data: { name: newName },
  });
}

export async function deleteAuthenticator(id: Authenticator['credentialID']) {
  return await prisma.authenticator.delete({ where: { credentialID: id } });
}

/**
 * add an authenticator to a user
 * @param userId user id
 * @param authenticator authenticator object
 */
export async function addAuthenticatorToUser(
  userId: string,
  authenticator: Omit<Authenticator, 'userId' | 'name' | 'createdAt' | 'updatedAt'>,
) {
  return await prisma.authenticator.create({
    data: {
      ...authenticator,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}
