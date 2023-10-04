import { createUserOrThrow, deleteUserByName } from './user.server.ts';
import { addPasswordToUser, verifyPasswordLogin } from './password.server.ts';
import { prisma } from '~/db.server.ts';

describe('createUser', () => {
  it('should create a user', async () => {
    await createUserOrThrow('test', 'testid');
    const user = await prisma.user.findUnique({ where: { name: 'test' } });
    expect(user).not.toBeNull();
  });
  it('should throw error if username already taken', async () => {
    await createUserOrThrow('test', 'testid');
    await expect(createUserOrThrow('test', 'testid2')).rejects.toThrow('username already taken');
  });
});

describe('deleteUserByName', () => {
  it('should delete a user', async () => {
    await createUserOrThrow('test', 'testid');
    await deleteUserByName('test');
    const user = await prisma.user.findUnique({ where: { name: 'test' } });
    expect(user).toBeNull();
  });
});

describe('verifyLogin', () => {
  it('should return user if login success', async () => {
    const user = await createUserOrThrow('test', 'testid');
    await addPasswordToUser(user.id, 'Test0000');
    const userWithPass = await verifyPasswordLogin('test', 'Test0000');
    expect(userWithPass).not.toBeNull();
  });
  it('should throw if login failed', async () => {
    const user = await createUserOrThrow('test', 'testid');
    await addPasswordToUser(user.id, 'Test0000');
    expect(verifyPasswordLogin('test', 'wrong password')).rejects.toThrow();
    expect(verifyPasswordLogin('wrong username', 'test')).rejects.toThrow();
  });
});
