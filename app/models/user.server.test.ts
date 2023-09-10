import {
  addPasswordToUser,
  createUser,
  deleteUserByName,
  verifyPasswordLogin,
} from './user.server.ts';
import { prisma } from '~/db.server.ts';

describe('createUser', () => {
  it('should create a user', async () => {
    await createUser('test');
    const user = await prisma.user.findUnique({ where: { name: 'test' } });
    expect(user).not.toBeNull();
  });
  it('should throw error if username already taken', async () => {
    await createUser('test');
    await expect(createUser('test')).rejects.toThrow('username already taken');
  });
});

describe('deleteUserByName', () => {
  it('should delete a user', async () => {
    await createUser('test');
    await deleteUserByName('test');
    const user = await prisma.user.findUnique({ where: { name: 'test' } });
    expect(user).toBeNull();
  });
});

describe('verifyLogin', () => {
  it('should return user if login success', async () => {
    const user = await createUser('test');
    await addPasswordToUser(user.id, 'test');
    const userWithPass = await verifyPasswordLogin('test', 'test');
    expect(userWithPass).not.toBeNull();
  });
  it('should return null if login failed', async () => {
    const user = await createUser('test');
    await addPasswordToUser(user.id, 'test');
    const userWithPass = await verifyPasswordLogin('test', 'wrong password');
    expect(userWithPass).toBeNull();
    const user2WithPass = await verifyPasswordLogin('wrong username', 'test');
    expect(user2WithPass).toBeNull();
  });
});
