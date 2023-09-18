import { type V2_MetaFunction, json, type LoaderArgs } from '@remix-run/node';
import { authenticator } from '~/services/auth.server.ts';

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  return json({});
}

export const meta: V2_MetaFunction = () => {
  return [{ title: '8bit stack' }];
};

export default function Index() {
  return <p>Hello</p>;
}
