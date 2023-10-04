import type { User } from '@prisma/client';

import { prisma } from '~/db.server.ts';

export type { User } from '@prisma/client';

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByName(name: User['name']) {
  return prisma.user.findUnique({ where: { name } });
}

/**
 * create a new user with the given name
 *
 * note that this function create no password or authenticator for the user
 * @param name user name
 * @throws {Error} if the name is already taken
 * @returns created user
 */
export async function createUserOrThrow(name: User['name'], id: User['id']) {
  const existingUser = await prisma.user.findUnique({ where: { name } });
  if (existingUser) throw new Error('username already taken');
  const user = await prisma.user.create({
    data: { id, name },
  });
  console.info('new user created:', user);
  return user;
}

export async function deleteUserByName(name: User['name']) {
  return prisma.user.delete({ where: { name } });
}

export async function setExpectedChallengeToUser(id: User['id'], expectedChallenge: string) {
  const user = await prisma.user.update({
    where: { id },
    data: { expectedChallenge },
  });
  return user;
}
