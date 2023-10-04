import type { ActionArgs, LoaderArgs, SerializeFrom, V2_MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { useState } from 'react';
import AuthFormInput from '~/components/AuthFormInput.tsx';
import Icon from '~/components/Icon.tsx';
import Overlay from '~/components/Overlay.tsx';
import {
  deleteAuthenticator,
  getAuthenticators,
  renameAuthenticator,
} from '~/models/authenticator.server.ts';
import { type User } from '~/models/user.server.ts';
import { authenticator } from '~/services/auth.server.ts';
import type { TransportsSplitAuthenticator } from '~/models/authenticator.server.ts';
import invariant from 'tiny-invariant';
import {
  addPasswordToUser,
  hasPassword,
  updatePassword,
  verifyPasswordLogin,
} from '~/models/password.server.ts';
import { getRequiredStringFromFormData } from '~/utils.ts';
import AuthButton from '~/components/AuthButton.tsx';
import PasskeyHero from '~/components/PasskeyHero.tsx';

export async function loader({ request }: LoaderArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  return json({
    user,
    authenticators: await getAuthenticators(user),
    hasPassword: await hasPassword(user.id),
  });
}

export async function action({ request }: ActionArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  const formData = await request.formData();
  const targetResource = formData.get('target-resource');
  const method = request.method.toLowerCase();

  if (targetResource === 'passkey') {
    const passkeyId = getRequiredStringFromFormData(formData, 'passkey-id');
    invariant(['put', 'delete'].includes(method), 'Method must be one of put, delete');

    if (method === 'put') {
      const name = getRequiredStringFromFormData(formData, 'passkey-name');
      await renameAuthenticator(passkeyId, name);
    } else if (method === 'delete') {
      if (!(await hasPassword(user.id)) && (await getAuthenticators(user)).length === 1) {
        return json(
          { errorMessage: 'You must have at least one passkey or password' },
          { status: 400 },
        );
      }
      await deleteAuthenticator(passkeyId);
    }
    return json({ ok: true });
  }

  if (targetResource === 'password') {
    invariant(['post', 'put'].includes(method), 'Method must be one of post, put');

    if (method === 'post') {
      const newPassword = getRequiredStringFromFormData(formData, 'new-password');
      const confirmNewPassword = getRequiredStringFromFormData(formData, 'confirm-new-password');
      if (newPassword !== confirmNewPassword) {
        return { errorMessage: 'New password and confirm new password must match.' };
      }
      try {
        await addPasswordToUser(user.id, newPassword);
      } catch (error) {
        if (error instanceof Error) {
          return { errorMessage: error.message };
        } else {
          throw error;
        }
      }
    } else if (method === 'put') {
      const oldPassword = getRequiredStringFromFormData(formData, 'old-password');
      try {
        await verifyPasswordLogin(user.name, oldPassword);
      } catch (error) {
        if (error instanceof Error) {
          return { errorMessage: error.message };
        } else {
          throw error;
        }
      }

      const newPassword = getRequiredStringFromFormData(formData, 'new-password');
      const confirmNewPassword = getRequiredStringFromFormData(formData, 'confirm-new-password');
      if (newPassword !== confirmNewPassword) {
        return { errorMessage: 'New password and confirm new password must match.' };
      }
      await updatePassword(user.id, newPassword);
      try {
        await addPasswordToUser(user.id, newPassword);
      } catch (error) {
        if (error instanceof Error) {
          return { errorMessage: error.message };
        } else {
          throw error;
        }
      }
    }

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
    <li
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
          <fetcher.Form
            method="put"
            className="mx-6 my-6"
            onSubmit={() => setIsPasskeyEditing(false)}
          >
            <input type="hidden" name="target-resource" id="target-resource" value="passkey" />
            <input
              type="hidden"
              name="passkey-id"
              id="passkey-id"
              value={props.authenticator.credentialID}
            />
            <AuthFormInput name="passkey-name" label="Passkey name" id="passkey-name" type="text" />
            <button type="submit" className="text-red-500">
              Update Passkey
            </button>
          </fetcher.Form>
        </div>
      </Overlay>
      <Overlay isShown={isPasskeyDeleting} setIsShown={setIsPasskeyDeleting}>
        <div className="w-96 rounded-lg border border-gray-300 bg-white">
          <p className="mx-6 my-6 text-2xl font-bold">Delete Passkey</p>
          <fetcher.Form
            method="delete"
            className="mx-6 my-6"
            onSubmit={() => setIsPasskeyDeleting(false)}
          >
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
    </li>
  );
}

function PasswordForm(props: { user: SerializeFrom<User>; hasPassword: boolean }) {
  const fetcher = useFetcher();
  const [showConfirmation, setShowConfirmation] = useState(false);
  return (
    <fetcher.Form
      method={props.hasPassword ? 'put' : 'post'}
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        setShowConfirmation(false);
      }}
    >
      <p className="text-red-500 ">{fetcher.data?.errorMessage}</p>
      <input type="hidden" name="target-resource" id="target-resource" value="password" />
      {props.hasPassword ? (
        <AuthFormInput name="old-password" label="Old password" id="old-password" type="password" />
      ) : null}
      <AuthFormInput name="new-password" label="New password" id="new-password" type="password" />
      <AuthFormInput
        name="confirm-new-password"
        label="Confirm new password"
        id="confirm-new-password"
        type="password"
      />
      <AuthButton type="button" onClick={() => setShowConfirmation(true)}>
        {(props.hasPassword ? 'Update' : 'Create') + ' Password'}
      </AuthButton>
      <Overlay isShown={showConfirmation} setIsShown={setShowConfirmation}>
        <div className="w-96 rounded-lg border border-gray-300 bg-white px-6 py-6">
          <p className="text-2xl font-bold">Update password</p>
          <p className="my-6">{`Are you sure you want to ${
            props.hasPassword ? 'update your' : 'create new'
          } password?`}</p>
          <AuthButton type="submit">
            {`${props.hasPassword ? 'Update my' : 'create new'} password`}
          </AuthButton>
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
          <ul className="flex flex-col gap-6">
            {loaderData.authenticators.map((passkey) => (
              <Passkey authenticator={passkey} key={passkey.credentialID} />
            ))}
          </ul>
          <Link
            to="/add-passkey"
            className="flex justify-center px-6 py-6 rounded-lg border border-dashed border-gray-300"
          >
            Add Passkey
          </Link>
          <PasskeyHero />
        </div>
        <div className="flex flex-col gap-6 pt-6">
          <p className="text-2xl font-bold">{`${
            loaderData.hasPassword ? 'Update' : 'Create'
          } Password`}</p>
          <PasswordForm user={loaderData.user} hasPassword={loaderData.hasPassword} />
        </div>
      </div>
    </div>
  );
}
