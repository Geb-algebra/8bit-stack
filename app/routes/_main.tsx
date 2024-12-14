import { PopoverClose } from "@radix-ui/react-popover";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, Outlet, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { authenticator } from "~/services/auth.server.ts";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/welcome",
  });
  return user;
}

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

function PopoverLink(props: { to: string; children: React.ReactNode }) {
  return (
    <PopoverClose asChild>
      <Button asChild variant="ghost">
        <Link to={props.to}>{props.children}</Link>
      </Button>
    </PopoverClose>
  );
}

export default function Index() {
  const user = useLoaderData<typeof loader>();

  return (
    <div className="w-full h-screen">
      <nav className="fixed w-full h-16 flex justify-between items-center bg-white border-b border-gray-300">
        <Link to="/">
          <h1 className="text-2xl font-bold mx-6">8bit stack</h1>
        </Link>
        <Popover>
          <PopoverTrigger className="px-6">{user.name}</PopoverTrigger>
          <PopoverContent hideWhenDetached className="flex flex-col w-36">
            <PopoverLink to="/settings">Settings</PopoverLink>
            <PopoverLink to="/logout">Log Out</PopoverLink>
          </PopoverContent>
        </Popover>
      </nav>
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}
