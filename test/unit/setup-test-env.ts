import { installGlobals } from '@remix-run/node';
import { beforeEach } from 'vitest';
import { resetDB } from 'test/utils';

installGlobals();

beforeEach(async () => {
  await resetDB();
});
