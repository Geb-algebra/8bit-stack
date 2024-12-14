import { createId } from "@paralleldrive/cuid2";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, data, redirect, useActionData, useLoaderData } from "@remix-run/react";
import type { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import { AccountRepository } from "~/accounts/lifecycle/account.server.ts";
import PasskeyHero from "~/components/PasskeyHero.tsx";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ObjectNotFoundError, ValueError } from "~/errors";
import { authenticator, verifyNewAuthenticator, webAuthnStrategy } from "~/services/auth.server.ts";
import { getSession, sessionStorage } from "~/services/session.server.ts";
import { getRequiredStringFromFormData } from "~/utils.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: "/welcome" });
  const session = await getSession(request);
  const options = await webAuthnStrategy.generateOptions(request, user);
  session.set("challenge", options.challenge);
  return data(options, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: "/welcome" });
  const session = await getSession(request);
  const expectedChallenge = session.get("challenge");
  if (!expectedChallenge) {
    throw new ValueError("Expected challenge not found.");
  }
  try {
    const formData = await request.formData();
    let data: RegistrationResponseJSON;
    try {
      const responseData = getRequiredStringFromFormData(formData, "response");
      data = JSON.parse(responseData);
    } catch {
      throw new ValueError("Invalid passkey response JSON.");
    }
    const account = await AccountRepository.getById(user.id);
    if (!account) throw new ObjectNotFoundError("Account not found.");
    const newAuthenticator = await verifyNewAuthenticator(data, expectedChallenge);
    account.authenticators.push({
      ...newAuthenticator,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: null,
    });
    await AccountRepository.save(account);
    throw redirect("/settings");
  } catch (error) {
    if (error instanceof Response && error.status >= 400) {
      return data({ error: (await error.json()) as { message: string } }, { status: error.status });
    }
    throw error;
  }
}

export const meta: MetaFunction = () => {
  return [{ title: "Add a new Passkey" }];
};

export default function Page() {
  const options = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="pt-24 w-full">
        <Card>
          <CardContent className="p-6 space-y-6">
            <Form
              method="post"
              onSubmit={handleFormSubmit(options, {
                generateUserId: createId,
              })}
            >
              <input type="hidden" name="username" value={options.user?.username} />
              <Button type="submit" name="intent" value="registration" className="w-full">
                Create a New Passkey
              </Button>
              <p className="text-red-600">{actionData?.error.message}</p>
            </Form>
            <PasskeyHero />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
