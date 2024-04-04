import { Box, Button } from "@mui/material";
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
    <Box sx={{ m: 2 }}>
      {error ? (
        <p>{error}</p>
      ) : (
        <Form method="post" action="">
          <Button type="submit" variant="outlined">
            Log out
          </Button>
        </Form>
      )}
    </Box>
  );
}
