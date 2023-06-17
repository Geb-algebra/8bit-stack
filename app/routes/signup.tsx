import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import AuthForm from '~/components/AuthForm';

import { authenticator, getAuthErrorMessage } from '~/services/auth.server';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });
  const errorMessage = await getAuthErrorMessage(request);
  return json({ errorMessage });
}

export async function action({ request }: ActionArgs) {
  return await authenticator.authenticate('user-pass', request, {
    successRedirect: '/',
    failureRedirect: '/signup',
  });
}

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Sign Up' }];
};

export default function LoginPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <AuthForm
          submitButtonText="Sign Up"
          errorMessage={loaderData.errorMessage}
          bottomText="Already have an account?"
          bottomLink={{ text: 'Log In', href: '/login' }}
          requestFrom="signup"
        />
      </div>
    </div>
  );
}
