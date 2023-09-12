import type { V2_MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { Outlet } from 'react-router-dom';

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Sign Up' }];
};

export default function LoginPage() {
  return (
    <>
      <Outlet />
      <div className="text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 underline">
          Log In
        </Link>
      </div>
    </>
  );
}
