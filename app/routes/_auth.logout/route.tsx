import {
  type ActionFunctionArgs,
  type TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import { getSession, lucia } from "~/lib/auth/session.server";

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<TypedResponse<{ error: string }>> => {
  const { session } = await getSession(request);
  if (!session) {
    return json({ error: "No user to log out" }, { status: 400 });
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  return redirect("/login", {
    headers: {
      "Set-Cookie": sessionCookie.serialize(),
    },
  });
};

export default function Page() {
  const error = useActionData<typeof action>()?.error;
  return (
    <div className="m-4">
      {error ? (
        <p>{error}</p>
      ) : (
        <Form method="post">
          <button type="submit" className="btn btn-primary mr-2">
            LOG OUT
          </button>
        </Form>
      )}
    </div>
  );
}
