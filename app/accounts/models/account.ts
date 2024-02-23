import type { Authenticator as TransportsJoinedAuthenticator, User } from '@prisma/client';

export type { User };
export type Authenticator = Omit<
  TransportsJoinedAuthenticator,
  'transports' | 'createdAt' | 'updatedAt' | 'userId'
> & {
  transports: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

export type Account = User & {
  authenticators: Authenticator[];
};
