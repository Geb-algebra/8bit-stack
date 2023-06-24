import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import AuthForm from '~/components/AuthForm';

import { authenticator } from '~/services/auth.server';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
  return json({});
}

export async function action({ request }: ActionArgs) {
  try {
    const cloneData = await request.clone().formData();
    const username = cloneData.get('username');
    const password = cloneData.get('password');
    if (!username || !password) {
      throw new Error('username and password are required');
    }
    await authenticator.authenticate('user-pass', request, {
      successRedirect: '/',
      throwOnError: true,
    });
    return json({ errorMessage: '' }, { status: 200 });
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response) return error;
    console.error(error);
    if (error instanceof Error) {
      return json({ errorMessage: error.message }, { status: 400 });
    } else {
      return json({ errorMessage: 'unknown error' }, { status: 500 });
    }
  }
}

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Login' }];
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <AuthForm
          submitButtonText="Log in"
          errorMessage={actionData?.errorMessage ?? ''}
          bottomText="Don't have an account?"
          bottomLink={{ text: 'Sign up', href: '/signup' }}
          requestFrom="login"
        />
      </div>
    </div>
  );
}
