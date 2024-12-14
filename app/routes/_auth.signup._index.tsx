import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
  data,
} from "react-router";

import { Form, useActionData, useLoaderData } from "react-router";

import { createId } from "@paralleldrive/cuid2";
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import PasskeyHero from "~/components/PasskeyHero.tsx";
import Google from "~/components/icons/Google";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { authenticator, webAuthnStrategy } from "~/services/auth.server.ts";
import { getSession, sessionStorage } from "~/services/session.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  await authenticator.isAuthenticated(request, { successRedirect: "/" });
  const session = await getSession(request);
  const options = await webAuthnStrategy.generateOptions(request, null);
  session.set("challenge", options.challenge);
  return data(options, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
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
      return data((await error.json()) as { message: string }, {
        status: error.status,
      });
    }
    console.error(error);
    if (error instanceof Error) {
      return data({ message: error.message }, { status: 400 });
    }
    return data({ message: "unknown error" }, { status: 500 });
  }
}

export const meta: MetaFunction = () => {
  return [{ title: "Sign Up" }];
};

export default function SignupPage() {
  const options = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signup</CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" action="/google">
          <Button type="submit" className="w-full">
            <Google className="w-6 mr-2" />
            Signup with Google
          </Button>
        </Form>
        <Separator className="my-6" />

        <h2 className="text-xl font-semibold my-4">Signup with Passkey</h2>
        <Form
          method="post"
          onSubmit={handleFormSubmit(options, {
            generateUserId: createId,
          })}
          className="space-y-6"
        >
          <p className="text-red-600">
            {actionData?.message ??
              (options.usernameAvailable === false ? "Username already taken" : "")}
          </p>
          <div>
            <Label>
              <Input
                name="username"
                id="username"
                placeholder="Username"
                type="text"
                readOnly={options.usernameAvailable ?? false}
                autoFocus
                required
              />
              Username
            </Label>
          </div>
          <Button
            type="submit"
            formMethod="GET"
            disabled={options.usernameAvailable ?? false}
            className="w-full"
          >
            Check Username
          </Button>
          {options.usernameAvailable ? (
            <Button type="submit" name="intent" value="registration" className="w-full">
              Signup with Passkey
            </Button>
          ) : null}
          <PasskeyHero />
        </Form>
      </CardContent>
    </Card>
  );
}
