import type { DataFunctionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { handleFormSubmit, type WebAuthnOptionsResponse } from 'remix-auth-webauthn';

import { authenticator } from '~/services/auth.server.ts';

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
    <>
      <Form method="post" onSubmit={handleFormSubmit(options, 'authentication')}>
        <p className="text-red-500 h-6">{actionData?.error.message ?? ''}</p>
        <button
          type="submit"
          className="bg-black text-white hover:bg-gray-700  focus:bg-gray-700 w-full py-2 px-4"
          value="authentication"
        >
          Log In with Passkey
        </button>
      </Form>
      <p className="h-6 border-y">or</p>
      <Link to="/login/password">
        <button className="bg-black text-white hover:bg-gray-700  focus:bg-gray-700 w-full py-2 px-4">
          Log In with Password
        </button>
      </Link>
    </>
  );
}
