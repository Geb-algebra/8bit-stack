import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs, json } from '@remix-run/node';
import invariant from 'tiny-invariant';
import {
  addPasswordToUser,
  updatePassword,
  verifyPasswordLogin,
} from '~/models/password.server.ts';
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
  invariant(['post', 'put'].includes(method), 'Method must be one of post, put');

  const newPassword = getRequiredStringFromFormData(formData, 'new-password');
  const confirmNewPassword = getRequiredStringFromFormData(formData, 'confirm-new-password');
  if (newPassword !== confirmNewPassword) {
    return json(
      { errorMessage: 'New password and confirm new password must match.' },
      { status: 400 },
    );
  }
  if (method === 'post') {
    try {
      await addPasswordToUser(user.id, newPassword);
    } catch (error) {
      if (error instanceof Error) {
        return json({ errorMessage: error.message }, { status: 400 });
      } else {
        throw error;
      }
    }
  } else if (method === 'put') {
    const oldPassword = getRequiredStringFromFormData(formData, 'old-password');
    try {
      await verifyPasswordLogin(user.name, oldPassword);
    } catch (error) {
      if (error instanceof Error) {
        return json({ errorMessage: error.message }, { status: 400 });
      } else {
        throw error;
      }
    }

    await updatePassword(user.id, newPassword);
    try {
      await addPasswordToUser(user.id, newPassword);
    } catch (error) {
      if (error instanceof Error) {
        return json({ errorMessage: error.message }, { status: 400 });
      } else {
        throw error;
      }
    }
  }

  return redirect('/settings');
}
