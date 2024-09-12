import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { AccountRepository } from "~/accounts/lifecycle/account.server.ts";
import type { Authenticator } from "~/accounts/models/account.ts";
import PasskeyHero from "~/components/PasskeyHero.tsx";
import { authenticator } from "~/services/auth.server.ts";

import { Label } from "@radix-ui/react-label";
import { Edit2Icon, TrashIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ObjectNotFoundError } from "~/errors";
import type { action as passkeyAction } from "~/routes/_main.settings.passkey.tsx";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: "/welcome" });
  const account = await AccountRepository.getById(user.id);
  if (!account) throw new ObjectNotFoundError("Account not found");
  return {
    user,
    authenticators: account.authenticators,
  };
}

export const meta: MetaFunction = () => {
  return [{ title: "Settings" }];
};

function Passkey(props: { authenticator: Authenticator }) {
  const fetcher = useFetcher<typeof passkeyAction>();
  return (
    <li
      className="flex items-center gap-6 px-4 py-4 rounded-lg border border-gray-300"
      key={props.authenticator.credentialID}
    >
      <div className="mr-auto">
        <p>{props.authenticator.name ?? "Unnamed"}</p>
        <p className="text-gray-500">
          Created at{" "}
          {props.authenticator.createdAt
            ? new Date(props.authenticator.createdAt).toLocaleString()
            : "Unknown"}
        </p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" size="icon">
            <Edit2Icon />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Edit Passkey</DialogTitle>
          <fetcher.Form method="put" action="/settings/passkey">
            <input
              type="hidden"
              name="passkey-id"
              id="passkey-id"
              value={props.authenticator.credentialID}
            />
            <Label>
              Passkey Name
              <Input
                name="passkey-name"
                id="passkey-name"
                placeholder="Passkey Name"
                type="text"
                className="mb-6"
              />
            </Label>
            <DialogClose asChild>
              <Button type="submit">Update Passkey</Button>
            </DialogClose>
          </fetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="ghost" size="icon">
            <TrashIcon />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Delete Passkey</DialogTitle>
          <fetcher.Form method="delete" action="/settings/passkey">
            <input
              type="hidden"
              name="passkey-id"
              id="passkey-id"
              value={props.authenticator.credentialID}
            />
            <p className="text-red-500 mb-6">
              {`Are you sure you want to delete passkey ${props.authenticator.name} ?`}
            </p>
            <DialogClose asChild>
              <Button type="submit" variant="destructive">
                Delete Passkey
              </Button>
            </DialogClose>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </li>
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
      </div>
    </div>
  );
}
