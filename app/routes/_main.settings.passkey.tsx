import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import {
  deleteAuthenticator,
  getAuthenticators,
  renameAuthenticator,
} from '~/models/authenticator.server.ts';
import { hasPassword } from '~/models/password.server.ts';
import { authenticator } from '~/services/auth.server.ts';
import { getRequiredStringFromFormData } from '~/utils.ts';

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/settings',
    failureRedirect: '/login',
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  const formData = await request.formData();
  const method = request.method.toLowerCase();

  const passkeyId = getRequiredStringFromFormData(formData, 'passkey-id');
  invariant(['put', 'delete'].includes(method), 'Method must be one of put, delete');

  if (method === 'put') {
    const name = getRequiredStringFromFormData(formData, 'passkey-name');
    await renameAuthenticator(passkeyId, name);
  } else if (method === 'delete') {
    if (!(await hasPassword(user.id)) && (await getAuthenticators(user)).length === 1) {
      return json(
        { errorMessage: 'You must have at least one passkey or password' },
        { status: 400 },
      );
    }
    await deleteAuthenticator(passkeyId);
  }
  return redirect('/settings');
}
