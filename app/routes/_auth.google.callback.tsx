// app/routes/auth/google/callback.tsx
import type { LoaderFunctionArgs } from "react-router";
import { authenticator } from "~/services/auth.server.ts";

export const loader = ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
