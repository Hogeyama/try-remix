import {
  type SubmissionResult,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  type ActionFunctionArgs,
  type TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { Argon2id } from "oslo/password";
import { z } from "zod";

import { Box, Button, TextField, Typography } from "@mui/material";

import { password, username } from "~/lib/auth/schema";
import { lucia } from "~/lib/auth/session.server";
import { prisma } from "~/lib/db";

const schema = z.object({
  username,
  password,
});

export const action = async ({
  request,
}: ActionFunctionArgs): Promise<TypedResponse<SubmissionResult>> => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const { username, password } = submission.value;

  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (!existingUser) {
    // NOTE:
    // Returning immediately allows malicious actors to figure out valid usernames from response times,
    // allowing them to only focus on guessing passwords in brute-force attacks.
    // As a preventive measure, you may want to hash passwords even for invalid usernames.
    // However, valid usernames can be already be revealed with the signup page among other methods.
    // It will also be much more resource intensive.
    // Since protecting against this is none-trivial,
    // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
    // If usernames are public, you may outright tell the user that the username is invalid.
    return json(
      submission.reply({
        formErrors: ["Incorrect username or password"],
      }),
    );
  }

  const validPassword = await new Argon2id().verify(
    existingUser.hashed_password,
    password,
  );
  if (!validPassword) {
    return json(
      submission.reply({
        formErrors: ["Incorrect username or password"],
      }),
    );
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  return redirect("/", {
    headers: {
      "Set-Cookie": sessionCookie.serialize(),
    },
  });
};

export default function Page() {
  const lastResult = useActionData<typeof action>();
  const [form, { username, password }] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Box sx={{ m: 2 }}>
      <h1>Login</h1>
      <Form method="post" {...getFormProps(form)}>
        <Box sx={{ m: 1 }}>
          <TextField
            label="Username"
            variant="outlined"
            {...getInputProps(username, { type: "text" })}
            error={(username.errors?.length ?? 0) > 0}
            helperText={username.errors?.join(",")}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          <TextField
            label="Password"
            variant="outlined"
            {...getInputProps(password, { type: "password" })}
            error={(password.errors?.length ?? 0) > 0}
            helperText={password.errors?.join(",")}
          />
        </Box>
        <Box sx={{ m: 1 }}>
          {(form.errors?.length ?? 0) > 0 && (
            <Typography color="error">{form.errors?.join(",")}</Typography>
          )}
        </Box>
        <Box sx={{ m: 1 }}>
          <Button type="submit" variant="outlined">
            Continue
          </Button>
        </Box>
        <Box sx={{ m: 1 }}>
          <Typography>
            Create an account <Link to="/signup">here</Link> if you don't have
            one.
          </Typography>
        </Box>
      </Form>
    </Box>
  );
}
