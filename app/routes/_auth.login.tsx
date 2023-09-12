import type { V2_MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { Outlet } from 'react-router-dom';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Log In' }];
};

export default function LoginPage() {
  return (
    <>
      <Outlet />
      <div className="text-center">
        Do not have an account?{' '}
        <Link to="/signup" className="text-blue-500 underline">
          Sign Up
        </Link>
      </div>
    </>
  );
}
