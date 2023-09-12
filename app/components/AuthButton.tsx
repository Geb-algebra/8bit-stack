export default function AuthButton(props: {
  type?: 'button' | 'submit' | 'reset' | undefined;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type={props.type}
      className="bg-black text-white hover:bg-gray-700  focus:bg-gray-700 w-full py-2 px-4 rounded-lg"
      value={props.value}
    >
      {props.children}
    </button>
  );
}
