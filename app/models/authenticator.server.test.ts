import { prisma } from '~/db.server.ts';
import { addAuthenticatorToUser } from './authenticator.server.ts';
import { createUserOrThrow } from './user.server.ts';

describe('addAuthenticatorToUser', () => {
  it('should add authenticator to user', async () => {
    const user = await createUserOrThrow('test', 'testid');
    await addAuthenticatorToUser(user.id, {
      credentialID: 'test',
      counter: 0,
      credentialPublicKey: 'test',
      credentialDeviceType: 'test',
      credentialBackedUp: 0,
      transports: 'test',
    });
    const userWithAuthenticator = await prisma.user.findUnique({
      where: { name: 'test' },
      include: {
        authenticators: true,
      },
    });
    expect(userWithAuthenticator?.authenticators).not.toBeNull();
  });
});
