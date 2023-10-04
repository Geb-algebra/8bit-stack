import bcrypt from 'bcryptjs';

import type { Password, User } from '@prisma/client';
import { prisma } from '~/db.server.ts';

export type { Password };

export function validatePassword(password: string) {
  if (password.length < 8) throw new Error('password must be at least 8 characters');
  if (password.length > 128) throw new Error('password must be less than 128 characters');
  if (!/[a-z]/.test(password)) throw new Error('password must contain a lowercase letter');
  if (!/[A-Z]/.test(password)) throw new Error('password must contain an uppercase letter');
  if (!/[0-9]/.test(password)) throw new Error('password must contain a number');
}

/**
 * add a password to a user
 */
export async function addPasswordToUser(userId: string, password: string) {
  validatePassword(password);
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
  validatePassword(password);
  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.password.update({
    where: { userId },
    data: {
      hash: hashedPassword,
    },
  });
}

export async function hasPassword(userId: User['id']) {
  const password = await prisma.password.findUnique({
    where: { userId },
  });
  return !!password;
}
