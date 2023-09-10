import type { Password, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { Authenticator } from 'remix-auth-webauthn';

import { prisma } from '~/db.server.ts';

export type { User } from '@prisma/client';

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByName(name: User['name']) {
  return prisma.user.findUnique({ where: { name } });
}

/**
 * create a new user with it
 *
 * note that this function create no password or authenticator for the user
 * @param name user name
 * @param password password before hashing
 * @returns created user
 */
export async function createUser(name: User['name']) {
  const existingUser = await prisma.user.findUnique({ where: { name } });
  if (existingUser) {
    throw new Error('username already taken');
  }
  const user = await prisma.user.create({
    data: { name },
  });
  console.info('new user created:', user);
  return user;
}

/**
 * add a password to a user
 */
export async function addPasswordToUser(userId: string, password: Password['hash']) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.password.create({
    data: {
      hash: hashedPassword,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

/**
 * add an authenticator to a user
 * @param userId user id
 * @param authenticator authenticator object
 */
export async function addAuthenticatorToUser(
  userId: string,
  authenticator: Omit<Authenticator, 'userId'>,
) {
  return prisma.authenticator.create({
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

export async function deleteUserByName(name: User['name']) {
  return prisma.user.delete({ where: { name } });
}

/**
 * check if a user can login.
 * @param name user name
 * @param password hashed password
 * @returns user without password
 * @throws {Error} if user not found, or password is invalid
 */
export async function verifyPasswordLogin(name: User['name'], password: Password['hash']) {
  const userWithPassword = await prisma.user.findUnique({
    where: { name },
    include: {
      password: true,
    },
  });

  if (!userWithPassword) throw new Error('user not found');
  if (!userWithPassword.password) throw new Error('user has no password');

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash);
  if (!isValid) throw new Error('invalid password');

  const { password: _password, ...userWithoutPassword } = userWithPassword;
  return userWithoutPassword;
}
