import { type V2_MetaFunction, json, type LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { authenticator } from '~/services/auth.server';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  return json(user);
}

export const meta: V2_MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Index() {
  const user = useLoaderData<typeof loader>();
  return (
    <div>
      <p>logged in as {user.name}</p>
      <Link to="/logout">Log out</Link>
    </div>
  );
}
