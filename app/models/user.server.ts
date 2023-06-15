import type { Password, User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '~/db.server';

export type { User } from '@prisma/client';

export const getUserById = async (id: User['id']) => {
  return prisma.user.findUnique({ where: { id } });
};

export const getUserByName = async (name: User['name']) => {
  return prisma.user.findUnique({ where: { name } });
};

/**
 * hash password and create a new user with it
 * @param name user name
 * @param password password before hashing
 * @returns created user
 */
export const createUser = async (name: User['name'], password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({ where: { name } });
    if (existingUser) {
      throw new Error('username already taken');
    }
    const user = await prisma.user.create({
      data: {
        name,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
    console.info('new user created:', user);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteUserByName = async (name: User['name']) => {
  return prisma.user.delete({ where: { name } });
};

/**
 * check if a user can login.
 * @param name user name
 * @param password hashed password
 * @returns user without password if login success, otherwise null
 */
export const verifyLogin = async (name: User['name'], password: Password['hash']) => {
  const userWithPassword = await prisma.user.findUnique({
    where: { name },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
};
