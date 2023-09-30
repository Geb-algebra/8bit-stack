import { prisma } from '~/db.server.ts';
import { addPasswordToUser } from './password.server.ts';
import { createUserOrThrow } from './user.server.ts';

describe('addPasswordToUser', () => {
  it('should add password to user', async () => {
    const user = await createUserOrThrow('test', 'testid');
    await addPasswordToUser(user.id, 'test');
    const userWithPassword = await prisma.user.findUnique({
      where: { name: 'test' },
      include: {
        password: true,
      },
    });
    expect(userWithPassword?.password).not.toBeNull();
  });
});
