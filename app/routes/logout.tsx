import type { LoaderArgs } from '@remix-run/node';

import { authenticator } from '~/services/auth.server.ts';

export async function loader({ request }: LoaderArgs) {
  return authenticator.logout(request, { redirectTo: '/login' });
}
