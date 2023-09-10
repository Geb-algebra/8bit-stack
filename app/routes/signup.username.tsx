import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import invariant from 'tiny-invariant';

import { json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import AuthFormInput from '~/components/AuthFormInput.tsx';

import { authenticator, isUsernameAvailable } from '~/services/auth.server.ts';
import { getSession } from '~/services/session.server.ts';

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
    if (!username) throw new Error('username is required');
    invariant(typeof username === 'string', 'username must be a string');
    if (!(await isUsernameAvailable(username))) throw new Error('username already taken');
    const session = await getSession(request);
    session.set('username', username);
    return redirect(`/signup/pass?username=${username}`);
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
  return [{ title: 'Sign Up' }];
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <p className="text-red-500 h-6">{actionData?.errorMessage ?? ''}</p>
        <Form method="post">
          <AuthFormInput
            name="username"
            label="Username"
            id="username"
            type="text"
            autofocus={true}
          />
          <button
            type="submit"
            className="bg-black text-white hover:bg-gray-700  focus:bg-gray-700 w-full py-2 px-4"
          >
            Next
          </button>
        </Form>
      </div>
    </div>
  );
}
