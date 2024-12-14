import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { Outlet } from "react-router";

export const meta: MetaFunction = () => {
  return [{ title: "Sign Up" }];
};

export default function LoginPage() {
  return (
    <>
      <Outlet />
      <div className="pt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500 underline">
          Log In
        </Link>
      </div>
    </>
  );
}
