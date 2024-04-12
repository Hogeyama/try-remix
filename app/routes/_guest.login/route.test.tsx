import { createRemixStub } from "@remix-run/testing";
import { render, screen, waitFor } from "@testing-library/react";
import { Argon2id } from "oslo/password";
import { beforeEach, describe, expect, test } from "vitest";

import { prisma } from "~/lib/db";

import Component, { action } from "./route";

describe("/login", () => {
  describe("render", () => {
    test("ユーザー名とパスワードのinputおよびボタンがある", async () => {
      // arrange
      const RemixStub = createRemixStub([{ path: "/", Component }]);
      render(<RemixStub />);

      // act: nop

      // assert
      await waitFor(async () => {
        expect(
          screen.getByLabelText("Username", { selector: "input" }),
        ).toBeVisible();
        expect(
          screen.getByLabelText("Password", { selector: "input" }),
        ).toBeVisible();
        expect(screen.getByRole("button", { name: /continue/i })).toBeVisible;
      });
    });
  });

  describe("action", async () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          id: "test_id",
          username: "test_user",
          hashed_password: await new Argon2id().hash("password"),
        },
      });
    });

    test("認証に成功するとクッキーが付与されトップにリダイレクトする", async () => {
      // arrange
      const body = new FormData();
      body.append("username", "test_user");
      body.append("password", "password");

      // act
      const resp = await action({
        request: new Request("http://localhost/login", {
          method: "POST",
          body,
        }),
        params: {},
        context: {},
      });

      // assert
      expect(resp.status).toBe(302);
      expect(resp.headers.get("Location")).toBe("/");
      expect(resp.headers.getSetCookie()).toSatisfy((cookies) =>
        (cookies as string[]).some((cookie) =>
          cookie.startsWith("auth_session="),
        ),
      );
    });

    test("認証に失敗するとエラーが返る（パスワード不一致）", async () => {
      // arrange
      const body = new FormData();
      body.append("username", "test_user");
      body.append("password", "buzzword");

      // act
      const resp = await action({
        request: new Request("http://localhost/login", {
          method: "POST",
          body,
        }),
        params: {},
        context: {},
      });

      // assert
      const res = await resp.json();
      expect(res.status).toBe("error");
      expect(JSON.stringify(res.error)).toContain(
        "Incorrect username or password",
      );
    });

    test("認証に失敗するとエラーが返る（バリデーションエラー）", async () => {
      // arrange
      const body = new FormData();
      body.append("username", "test_user");
      body.append("password", "buzz");

      // act
      const resp = await action({
        request: new Request("http://localhost/login", {
          method: "POST",
          body,
        }),
        params: {},
        context: {},
      });

      // assert
      const res = await resp.json();
      expect(res.status).toBe("error");
      expect(JSON.stringify(res.error?.password)).toContain(
        "String must contain at least 6 character(s)",
      );
    });
  });
});
