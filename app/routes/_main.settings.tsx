import type { ActionArgs, LoaderArgs, SerializeFrom, V2_MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import AuthFormInput from '~/components/AuthFormInput.tsx';
import Icon from '~/components/Icon.tsx';
import Overlay from '~/components/Overlay.tsx';
import { getAuthenticators, renameAuthenticator } from '~/models/authenticator.server.ts';
import { verifyPasswordLogin, type User, updatePassword } from '~/models/user.server.ts';
import { authenticator } from '~/services/auth.server.ts';
import type { TransportsSplitAuthenticator } from '~/models/authenticator.server.ts';
import invariant from 'tiny-invariant';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  const authenticators = await getAuthenticators(user);
  return json({ user, authenticators });
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const targetResource = formData.get('target-resource');

  if (targetResource === 'passkey') {
    const passkeyId = formData.get('passkey-id');
    if (!passkeyId) return { errorMessage: 'Target passkey id is required.' };
    invariant(typeof passkeyId === 'string', 'Target passkey id must be a string.');
    const method = request.method.toLowerCase();
    invariant(
      ['post', 'put', 'delete'].includes(method),
      'Method must be one of post, put, delete',
    );

    if (method === 'post') {
      return null;
    } else if (method === 'put') {
      const name = formData.get('passkey-name');
      if (!name) return { errorMessage: 'Passkey name is required.' };
      invariant(typeof name === 'string', 'Passkey name must be a string.');
      await renameAuthenticator(passkeyId, name);
      return null;
    } else if (method === 'delete') {
      // TODO: Uncomment delete passkey after making a way to create another passkey
      // await deleteAuthenticator(passkeyId);
      return null;
    }
    return redirect('/');
  }

  if (targetResource === 'password') {
    const username = formData.get('username');
    const oldPassword = formData.get('old-password');
    invariant(typeof username === 'string', 'Username must be a string.');
    invariant(typeof oldPassword === 'string', 'Old password must be a string.');
    let user: User;
    try {
      user = await verifyPasswordLogin(username, oldPassword);
    } catch (error) {
      if (error instanceof Error) {
        return { errorMessage: error.message };
      } else {
        throw error;
      }
    }

    const newPassword = formData.get('new-password');
    const confirmNewPassword = formData.get('confirm-new-password');
    invariant(typeof newPassword === 'string', 'New password must be a string.');
    invariant(typeof confirmNewPassword === 'string', 'Confirm new password must be a string.');
    if (newPassword !== confirmNewPassword) {
      return { errorMessage: 'New password and confirm new password must match.' };
    }
    await updatePassword(user.id, newPassword);

    return redirect('/settings');
  }
}

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Settings' }];
};

function Passkey(props: { authenticator: SerializeFrom<TransportsSplitAuthenticator> }) {
  const fetcher = useFetcher();
  const [isPasskeyEditing, setIsPasskeyEditing] = useState(false);
  const [isPasskeyDeleting, setIsPasskeyDeleting] = useState(false);
  return (
    <div
      className="flex items-center gap-6 px-4 py-4 rounded-lg border border-gray-300"
      key={props.authenticator.credentialID}
    >
      <div className="mr-auto">
        <p>{props.authenticator.name ?? 'Unnamed'}</p>
        <p className="text-gray-500">
          Created at {new Date(props.authenticator.createdAt).toLocaleString()}
        </p>
      </div>
      <button onClick={() => setIsPasskeyEditing(true)}>
        <Icon name="edit" />
      </button>
      <button onClick={() => setIsPasskeyDeleting(true)}>
        <Icon name="delete" />
      </button>
      <Overlay isShown={isPasskeyEditing} setIsShown={setIsPasskeyEditing}>
        <div className="w-96 rounded-lg border border-gray-300 bg-white">
          <p className="mx-6 my-6 text-2xl font-bold">Edit Passkey</p>
          <fetcher.Form method="put" className="mx-6 my-6">
            <input type="hidden" name="target-resource" id="target-resource" value="passkey" />
            <input
              type="hidden"
              name="passkey-id"
              id="passkey-id"
              value={props.authenticator.credentialID}
            />
            <AuthFormInput name="passkey-name" label="Passkey name" id="passkey-name" type="text" />
            <button
              type="submit"
              className="text-red-500"
              onClick={() => setIsPasskeyEditing(false)}
            >
              Update Passkey
            </button>
          </fetcher.Form>
        </div>
      </Overlay>
      <Overlay isShown={isPasskeyDeleting} setIsShown={setIsPasskeyDeleting}>
        <div className="w-96 rounded-lg border border-gray-300 bg-white">
          <p className="mx-6 my-6 text-2xl font-bold">Delete Passkey</p>
          <fetcher.Form method="delete" className="mx-6 my-6">
            <input type="hidden" name="target-resource" id="target-resource" value="passkey" />
            <input
              type="hidden"
              name="passkey-id"
              id="passkey-id"
              value={props.authenticator.credentialID}
            />
            <p className="text-red-500">
              {`Are you sure you want to delete passkey ${props.authenticator.name} ?`}
            </p>
            <button type="submit" className="text-red-500">
              Delete Passkey
            </button>
          </fetcher.Form>
        </div>
      </Overlay>
    </div>
  );
}

function PasswordUpdateForm(props: { user: SerializeFrom<User> }) {
  const fetcher = useFetcher();
  const [showConfirmation, setShowConfirmation] = useState(false);
  return (
    <fetcher.Form method="put" className="flex flex-col gap-6">
      <p className="text-red-500 ">{fetcher.data?.errorMessage}</p>
      <input type="hidden" name="target-resource" id="target-resource" value="password" />
      <input type="hidden" name="username" id="username" value={props.user.name} />
      <AuthFormInput name="old-password" label="Old password" id="old-password" type="password" />
      <AuthFormInput name="new-password" label="New password" id="new-password" type="password" />
      <AuthFormInput
        name="confirm-new-password"
        label="Confirm new password"
        id="confirm-new-password"
        type="password"
      />
      <button type="button" onClick={() => setShowConfirmation(true)} className="text-red-500">
        Update Password
      </button>
      <Overlay isShown={showConfirmation} setIsShown={setShowConfirmation}>
        <div className="w-96 rounded-lg border border-gray-300 bg-white">
          <p className="mx-6 my-6 text-2xl font-bold">Update password</p>
          <p className="mx-6 my-6">Are you sure you want to update your password?</p>
          <button
            type="submit"
            className="text-red-500 mx-6 mb-6"
            onClick={(e) => {
              setShowConfirmation(false);
              fetcher.submit(e.currentTarget.form);
            }}
          >
            Update my password
          </button>
        </div>
      </Overlay>
    </fetcher.Form>
  );
}

export default function Page() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="w-full h-full">
      <div className="max-w-lg mx-auto pt-6">
        <div className="flex flex-col gap-6">
          <p className="text-2xl font-bold">Passkeys</p>
          <div className="flex flex-col gap-6">
            {loaderData.authenticators.map((passkey) => (
              <Passkey authenticator={passkey} key={passkey.credentialID} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6 pt-6">
          <p className="text-2xl font-bold">Update Password</p>
          <PasswordUpdateForm user={loaderData.user} />
        </div>
      </div>
    </div>
  );
}
