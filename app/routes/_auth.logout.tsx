import type { LoaderFunctionArgs } from "react-router";

import { authenticator } from "~/services/auth.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  return authenticator.logout(request, { redirectTo: "/welcome" });
}
