import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Outlet } from "react-router";

export const meta: MetaFunction = () => {
  return [{ title: "Log In" }];
};

export default function LoginPage() {
  return (
    <>
      <Outlet />
      <div className="pt-6 text-center">
        Do not have an account?{" "}
        <Link to="/signup" className="text-blue-500 underline">
          Sign Up
        </Link>
      </div>
    </>
  );
}
