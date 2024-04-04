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
import { Form, useActionData } from "@remix-run/react";
import { Argon2id } from "oslo/password";
import { z } from "zod";

import { Box, Button, TextField, Typography } from "@mui/material";

import { Prisma } from "@prisma/client";
import { generateId } from "lucia";
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

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  try {
    await prisma.user.create({
      data: {
        id: userId,
        username: username,
        hashed_password: hashedPassword,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return json(
          submission.reply({
            fieldErrors: {
              username: ["Username already exists"],
            },
          }),
        );
      }
    }
    throw err;
  }

  const session = await lucia.createSession(userId, {});
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
      <h1>Create an account</h1>
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
      </Form>
    </Box>
  );
}
