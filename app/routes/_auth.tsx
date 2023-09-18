import { Outlet } from '@remix-run/react';

export default function AuthLayout() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <main className="pt-24 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}