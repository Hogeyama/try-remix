import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, useLoaderData } from "@remix-run/react";
import { getSession } from "~/lib/auth/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user, freshCookieIfNeeded: headers } = await getSession(request);
  if (!user) {
    return redirect("/login");
  }
  return json({ user }, { headers });
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="m-4">
      <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
        <h1 className="text-xl font-bold">Hello, {user.username}</h1>
      </div>
    </div>
  );
}
