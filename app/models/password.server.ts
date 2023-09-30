import bcrypt from 'bcryptjs';

import type { Password, User } from '@prisma/client';
import { prisma } from '~/db.server.ts';

export type { Password };

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

export async function updatePassword(userId: User['id'], password: Password['hash']) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.password.update({
    where: { userId },
    data: {
      hash: hashedPassword,
    },
  });
}
