import { Form, Link } from '@remix-run/react';

function Input(props: {
  name: string;
  label: string;
  id: string;
  type: string;
  autofocus?: boolean;
  className?: string;
}) {
  return (
    <div className="w-full h-10 pb-6">
      <label htmlFor={props.name}>{props.label}</label>
      <input
        required
        autoFocus={props.autofocus ?? false}
        name={props.name}
        id={props.id}
        type={props.type}
        className="w-full border px-2 py-1 h-10"
      />
    </div>
  );
}

export default function AuthForm(props: {
  submitButtonText: string;
  errorMessage?: string;
  bottomText: string;
  bottomLink: { text: string; href: string };
  requestFrom: string;
}) {
  return (
    <Form method="post" className="space-y-6">
      <p className="text-red-500 my-3">{props.errorMessage}</p>
      <Input name="username" label="Username" id="username" type="text" autofocus={true} />
      <Input name="password" label="Password" id="password" type="password" />
      <input type="hidden" name="requestFrom" value={props.requestFrom} />
      <button
        type="submit"
        className="bg-blue-500 text-white hover:bg-blue-600  focus:bg-blue-400 w-full py-2 px-4"
      >
        {props.submitButtonText}
      </button>
      <div className="text-center">
        {props.bottomText}{' '}
        <Link to={props.bottomLink.href} className="text-blue-500 underline">
          {props.bottomLink.text}
        </Link>
      </div>
    </Form>
  );
}
