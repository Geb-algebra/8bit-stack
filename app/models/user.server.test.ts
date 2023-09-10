import { createUser, deleteUserByName, verifyLogin } from './user.server.ts';
import { prisma } from '~/db.server.ts';

describe('createUser', () => {
  it('should create a user', async () => {
    await createUser('test', 'test');
    const user = await prisma.user.findUnique({ where: { name: 'test' } });
    expect(user).not.toBeNull();
  });
  it('should throw error if username already taken', async () => {
    await createUser('test', 'test');
    await expect(createUser('test', 'test')).rejects.toThrow('username already taken');
  });
});

describe('deleteUserByName', () => {
  it('should delete a user', async () => {
    await createUser('test', 'test');
    await deleteUserByName('test');
    const user = await prisma.user.findUnique({ where: { name: 'test' } });
    expect(user).toBeNull();
  });
});

describe('verifyLogin', () => {
  it('should return user if login success', async () => {
    await createUser('test', 'test');
    const user = await verifyLogin('test', 'test');
    expect(user).not.toBeNull();
  });
  it('should return null if login failed', async () => {
    await createUser('test', 'test');
    const user = await verifyLogin('test', 'wrong password');
    expect(user).toBeNull();
    const user2 = await verifyLogin('wrong username', 'test');
    expect(user2).toBeNull();
  });
});
