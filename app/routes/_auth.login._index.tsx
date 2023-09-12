import {
  json,
  type DataFunctionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import { handleFormSubmit, type WebAuthnOptionsResponse } from 'remix-auth-webauthn';

import { authenticator } from '~/services/auth.server.ts';
import AuthContainer from '~/components/AuthContainer.tsx';
import AuthButton from '~/components/AuthButton.tsx';
import AuthErrorMessage from '~/components/AuthErrorMessage.tsx';
import { redirect } from 'react-router-dom';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, { successRedirect: '/' });
  // When we pass a GET request to the authenticator, it will
  // throw a response that includes the WebAuthn options and
  // stores the challenge on session storage. To avoid needing
  // a CatchBoundary, we catch the response here and return it as
  // loader data.
  try {
    await authenticator.authenticate('webauthn', request);
  } catch (response) {
    if (response instanceof Response && response.status === 200) {
      return response;
    }
    throw response;
  }
}

export async function action({ request }: DataFunctionArgs) {
  try {
    await authenticator.authenticate('webauthn', request, {
      successRedirect: '/',
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 400) {
      return { error: (await error.json()) as { message: string } };
    }
    throw error;
  }
  return null;
}

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Log In' }];
};

export default function LoginPage() {
  const options = useLoaderData<WebAuthnOptionsResponse>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex flex-col gap-6">
      <AuthErrorMessage message={actionData?.error.message} />
      <AuthContainer>
        <Form method="post" onSubmit={handleFormSubmit(options, 'authentication')}>
          <AuthButton type="submit" value="authentication">
            Log In with Passkey
          </AuthButton>
        </Form>
        <p className="h-6 w-full text-center">or</p>
        <Link to="/login/password">
          <AuthButton>Log In with Password</AuthButton>
        </Link>
      </AuthContainer>
    </div>
  );
}
