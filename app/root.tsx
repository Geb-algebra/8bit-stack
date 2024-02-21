import type { LinksFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import stylesheet from '~/styles/tailwind.css?url';
import rdtStylesheet from 'remix-development-tools/index.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' },
  ...(process.env.NODE_ENV === 'development' ? [{ rel: 'stylesheet', href: rdtStylesheet }] : []),
];

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

let AppExport = App;
// This imports the dev tools only if you're in development
if (process.env.NODE_ENV === 'development') {
  const { withDevTools } = await import('remix-development-tools');
  AppExport = withDevTools(AppExport);
}
export default AppExport;
