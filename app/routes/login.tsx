import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';

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
    failureRedirect: '/login',
  });
}

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Login' }];
};

export default function LoginPage() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <Form method="post">
      <div>{loaderData.errorMessage}</div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          required
          autoFocus={true}
          name="username"
          id="username"
          type="text"
          aria-invalid={loaderData?.errorMessage ? true : undefined}
          aria-describedby="username-error"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          name="password"
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={loaderData?.errorMessage ? true : undefined}
          aria-describedby="password-error"
        />
      </div>
      <input type="hidden" name="requestFrom" value="login" />
      <button type="submit">Log in</button>
      <div>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </Form>
  );
}
