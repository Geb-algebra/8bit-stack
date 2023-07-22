import { installGlobals } from '@remix-run/node';
import { beforeEach } from 'vitest';
import { resetDB } from 'test/utils';
import { server } from 'mocks/mock-server';

installGlobals();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

beforeEach(async () => {
  await resetDB();
  server.resetHandlers();
});

afterAll(() => server.close());
