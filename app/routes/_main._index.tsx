import { type LoaderFunctionArgs, type MetaFunction, json } from "@remix-run/node";
import { authenticator } from "~/services/auth.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, { failureRedirect: "/welcome" });
  return null;
}

export const meta: MetaFunction = () => {
  return [{ title: "8bit stack" }];
};

export default function Index() {
  return <p>Hello</p>;
}
