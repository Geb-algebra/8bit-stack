import { createId } from "@paralleldrive/cuid2";
import { type LoaderFunctionArgs, type MetaFunction, unstable_defineAction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import invariant from "tiny-invariant";
import PasskeyHero from "~/components/PasskeyHero";
import Google from "~/components/icons/Google";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

import { authenticator, webAuthnStrategy } from "~/services/auth.server.ts";
import { getSession, sessionStorage } from "~/services/session.server.ts";

export async function loader({ request, response }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  const session = await getSession(request);
  const options = await webAuthnStrategy.generateOptions(request, null);
  session.set("challenge", options.challenge);
  invariant(response);
  response.headers.set("Set-Cookie", await sessionStorage.commitSession(session));
  response.headers.set("Cache-Control", "no-store");
  return options;
}

export const action = unstable_defineAction(async ({ request, response }) => {
  try {
    await authenticator.authenticate("webauthn", request, {
      successRedirect: "/",
    });
    return { message: "" };
  } catch (error) {
    // Because redirects work by throwing a Response, you need to check if the
    // caught error is a response and return it or throw it again
    if (error instanceof Response && error.status < 400) throw error;
    if (error instanceof Response) {
      response.status = error.status;
      return (await error.json()) as { message: string };
    }
    console.error(error);
    if (error instanceof Error) {
      response.status = 400;
      return { message: error.message };
    }
    response.status = 500;
    return { message: "unknown error" };
  }
});

export const meta: MetaFunction = () => {
  return [{ title: "Log In" }];
};

export default function LoginPage() {
  const options = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form method="post" action="/google">
          <Button type="submit" className="w-full">
            <Google className="w-6 mr-2" />
            Login with Google
          </Button>
        </Form>
        <Separator />
        <Form
          method="post"
          onSubmit={handleFormSubmit(options, {
            generateUserId: createId,
          })}
        >
          <p className="text-red-600">{actionData?.message}</p>
          <Button type="submit" name="intent" value="registration" className="w-full">
            Login with Passkey
          </Button>
          <PasskeyHero className="mt-6" />
        </Form>
      </CardContent>
    </Card>
  );
}
