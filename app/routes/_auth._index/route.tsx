import type { MetaFunction } from "@remix-run/node";

import { useUserSession } from "../_auth/lib";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const { user } = useUserSession();
  return (
    <div className="m-4">
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        <h1 className="text-xl font-bold">Hello, {user.username}</h1>
      </div>
    </div>
  );
}
