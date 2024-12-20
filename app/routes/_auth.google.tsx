// app/routes/auth/google.tsx
import { type ActionFunctionArgs, redirect } from "react-router";
import { authenticator } from "~/services/auth.server.ts";

export async function loader() {
  throw redirect("/");
}

export const action = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate("google", request);
};
