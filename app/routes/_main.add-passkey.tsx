import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, Form } from '@remix-run/react';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import AuthButton from '~/components/AuthButton.tsx';
import AuthContainer from '~/components/AuthContainer.tsx';
import AuthErrorMessage from '~/components/AuthErrorMessage.tsx';
import { addAuthenticatorToUser } from '~/models/authenticator.server.ts';
import { getUserById, setExpectedChallengeToUser } from '~/models/user.server.ts';
import {
  WEBAUTHN_RP_ID,
  WEBAUTHN_RP_NAME,
  authenticator,
  verifyNewAuthenticator,
} from '~/services/auth.server.ts';
import { handleFormSubmit } from '~/services/webauthn.ts';
import { getRequiredStringFromFormData } from '~/utils.ts';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  // When we pass a GET request to the authenticator, it will
  // throw a response that includes the WebAuthn options and
  // stores the challenge on session storage. To avoid needing
  // a CatchBoundary, we catch the response here and return it as
  // loader data.
  const options = await generateRegistrationOptions({
    rpName: WEBAUTHN_RP_NAME,
    rpID: WEBAUTHN_RP_ID,
    userID: user.id,
    userName: user.name,
    timeout: 60000,
    attestationType: 'none',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });
  await setExpectedChallengeToUser(user.id, options.challenge);
  return json(options);
}

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  const expectedChallenge = (await getUserById(user.id))?.expectedChallenge ?? '';
  console.log(expectedChallenge);
  try {
    const formData = await request.formData();
    let data: RegistrationResponseJSON;
    try {
      const responseData = getRequiredStringFromFormData(formData, 'response');
      data = JSON.parse(responseData);
    } catch {
      throw new Error('Invalid passkey response JSON.');
    }
    const newAuthenticator = await verifyNewAuthenticator(data, expectedChallenge);
    await addAuthenticatorToUser(user.id, newAuthenticator);
    throw redirect('/settings');
  } catch (error) {
    if (error instanceof Response && error.status >= 400) {
      return { error: (await error.json()) as { message: string } };
    }
    throw error;
  }
}

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Add a new Passkey' }];
};

export default function Page() {
  const options = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="pt-24 w-full">
        <div className="flex flex-col gap-6">
          <AuthErrorMessage message={actionData?.error.message} />
          <AuthContainer>
            <Form method="post" onSubmit={handleFormSubmit(options)}>
              <AuthButton type="submit" value="registration">
                Create a New Passkey
              </AuthButton>
            </Form>
          </AuthContainer>
        </div>
      </div>
    </div>
  );
}
