// app/routes/auth/google.tsx
import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { authenticator } from "~/services/auth.server.ts";

export async function loader({ response }: LoaderFunctionArgs) {
  invariant(response);
  response.status = 302;
  response.headers.set("Location", "/");
  throw response;
}

export const action = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate("google", request);
};
