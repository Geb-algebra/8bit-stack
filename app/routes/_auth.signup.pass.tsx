import type { DataFunctionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData, useSearchParams } from '@remix-run/react';
import AuthFormInput from '~/components/AuthFormInput.tsx';
import invariant from 'tiny-invariant';
import { handleFormSubmit, type WebAuthnOptionsResponse } from 'remix-auth-webauthn';

import { authenticator, isUsernameAvailable } from '~/services/auth.server.ts';
import AuthContainer from '~/components/AuthContainer.tsx';
import AuthButton from '~/components/AuthButton.tsx';
import AuthErrorMessage from '~/components/AuthErrorMessage.tsx';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, { successRedirect: '/' });

  const username = new URL(request.url).searchParams.get('username');
  invariant(!!username, 'username is required');
  invariant(await isUsernameAvailable(username), 'username already taken');
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
  const cloneData = await request.clone().formData();
  const authMethod = cloneData.get('auth-method');
  invariant(typeof authMethod === 'string', 'auth-method is required');
  invariant(authMethod, 'auth-method is required');
  try {
    await authenticator.authenticate(authMethod, request, {
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
  return [{ title: 'Sign Up' }];
};

export default function LoginPage() {
  const options = useLoaderData<WebAuthnOptionsResponse>();
  const actionData = useActionData<typeof action>();

  const searchParams = useSearchParams()[0];
  const username = searchParams.get('username');
  invariant(!!username, 'username is required');

  return (
    <div className="flex flex-col gap-6">
      <AuthContainer>
        <AuthFormInput
          name="username"
          label="Username"
          id="username"
          type="text"
          disabled={true}
          value={username}
        />
      </AuthContainer>
      <AuthErrorMessage message={actionData?.error.message} />
      <AuthContainer>
        <Form method="post" onSubmit={handleFormSubmit(options)}>
          {/* remix-auth-webauthn requires that the id of this form being "email" and name being "username" */}
          <input type="hidden" name="username" id="email" value={username} />
          <input type="hidden" name="auth-method" id="auth-method" value="webauthn" />
          <AuthButton type="submit" value="registration">
            Sign Up with Passkey
          </AuthButton>
        </Form>
        <p className="h-6 text-center">or</p>
        <Form method="post" className="flex flex-col gap-6">
          <input type="hidden" name="username" id="username" value={username} />
          <input type="hidden" name="auth-method" id="auth-method" value="user-pass" />
          <input type="hidden" name="type" id="type" value="registration" />
          <AuthFormInput name="password" label="Password" id="password" type="password" />
          <AuthButton type="submit">Sign Up with Password</AuthButton>
        </Form>
      </AuthContainer>
    </div>
  );
}
