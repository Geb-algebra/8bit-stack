import { prisma } from './db.server';

export const deleteThisCreateUser = async () => {
  const user = await prisma.deleteThisUser.create({
    data: {
      email: 'foo@example.com',
      name: 'Foo',
    },
  });
  return user;
};
