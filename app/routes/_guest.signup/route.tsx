import {
  type SubmissionResult,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Prisma } from "@prisma/client";
import {
  type ActionFunctionArgs,
  type TypedResponse,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { z } from "zod";

import { PasswordInput, UsernameInput } from "~/lib/auth/components";
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
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return json(
        submission.reply({
          fieldErrors: {
            username: ["Username already exists"],
          },
        }),
      );
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
    <div className="m-2">
      <h1 className="font-bold text-xl">Signup</h1>
      <div className="ml-3">
        <Form method="post" {...getFormProps(form)}>
          <UsernameInput
            className="my-3"
            inputAttrs={getInputProps(username, { type: "text" })}
            error={username.errors?.join(",")}
          />
          <PasswordInput
            className="my-3"
            inputAttrs={getInputProps(password, { type: "password" })}
            error={password.errors?.join(",")}
          />
          <div className="my-3 flex items-center">
            <button type="submit" className="btn mr-2">
              CREATE ACCOUNT
            </button>
            <span className="text-error text-lg">{form.errors?.join(",")}</span>
          </div>
          <div className="m-2">
            Do you have an account?{" "}
            <a href="/login" className="link">
              Login
            </a>{" "}
            here.
          </div>
        </Form>
      </div>
    </div>
  );
}
