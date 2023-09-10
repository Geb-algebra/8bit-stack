import type { Authenticator, User } from '@prisma/client';
import { prisma } from '~/db.server';

export type { Authenticator };

export async function getAuthenticators(user: User) {
  const authenticators = await prisma.authenticator.findMany({
    where: { userId: user.id },
  });
  return authenticators.map((authenticator) => ({
    ...authenticator,
    transports: authenticator.transports.split(','),
  }));
}

export async function getAuthenticatorById(id: Authenticator['credentialID']) {
  return prisma.authenticator.findUnique({ where: { credentialID: id } });
}
