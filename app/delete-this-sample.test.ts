import { expect, describe, it } from 'vitest';
import { prisma } from './db.server';
import { deleteThisCreateUser } from './delete-this-sample';

describe('deleteThisCreateUser', () => {
  it('creates a user', async () => {
    const user = await deleteThisCreateUser();
    const foundUsers = await prisma.deleteThisUser.findMany();
    expect(foundUsers).toEqual([user]);
  });
});
