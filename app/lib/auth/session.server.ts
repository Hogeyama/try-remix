import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
import { type TypedResponse, json } from "@remix-run/node";
import { redirect } from "@remix-run/react";
import { Lucia, type Session, type User, verifyRequestOrigin } from "lucia";

const client = new PrismaClient();
const adapter = new PrismaAdapter(client.session, client.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
}

export const getSession = async (
  request: Request,
): Promise<
  | {
      user: User;
      session: Session;
      freshCookieIfNeeded: HeadersInit;
      error?: undefined;
    }
  | {
      user?: undefined;
      session?: undefined;
      freshCookieIfNeeded?: undefined;
      error: "unauthorized" | "forbidden";
    }
> => {
  // CSRF protection
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");
  if (
    process.env.NODE_ENV === "production" &&
    !hostHeader?.startsWith("localhost:") &&
    (!originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader]))
  ) {
    return { error: "forbidden" };
  }

  // parse session id
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = lucia.readSessionCookie(cookieHeader ?? "");
  if (!sessionId) {
    return {
      error: "unauthorized",
    };
  }

  const result = await lucia.validateSession(sessionId);
  if (result.session == null || result.user == null)
    return {
      error: "unauthorized",
    };

  const freshCookieIfNeeded = new Headers();
  if (result.session?.fresh) {
    const newCookie = lucia.createSessionCookie(result.session.id);
    freshCookieIfNeeded.append("Set-Cookie", newCookie.serialize());
  }

  return Object.assign(result, { freshCookieIfNeeded });
};

export const getSessionOrRedirect = async (
  request: Request,
): Promise<{ user: User; session: Session }> => {
  const [_, result] = await getSessionOrRedirectForAction(request);
  return result;
};

export const getSessionOrRedirectForAction = async (
  request: Request,
): Promise<
  [
    // A variant of json that adds the fresh cookie if needed.
    // NOTE: Do not use this in loader. See https://remix.run/docs/en/main/guides/gotchas#writing-to-sessions-in-loaders
    <T>(val: T, init?: ResponseInit) => TypedResponse<T>,
    { user: User; session: Session },
  ]
> => {
  const result = await getSession(request);
  if (result.error) {
    throw redirect("/login");
  }
  return [jsonWithExtraHeaders(result.freshCookieIfNeeded), result];
};

const jsonWithExtraHeaders: <T>(
  h: HeadersInit,
) => (val: T, init?: ResponseInit) => TypedResponse<T> =
  (h) => (val, init?: ResponseInit) => {
    return json(
      val,
      Object.assign({}, init, {
        headers: init?.headers ? mergeHeaders(init?.headers, h) : h,
      }),
    );
  };

function mergeHeaders(h1: HeadersInit, h2: HeadersInit): HeadersInit {
  const toHeaders = (h: HeadersInit) => {
    if (h instanceof Headers) {
      return h;
    }
    if (Array.isArray(h)) {
      const headers = new Headers();
      for (const [key, value] of h) {
        headers.append(key, value);
      }
      return headers;
    }
    return new Headers(h);
  };

  const mergedHeaders = new Headers();
  toHeaders(h1).forEach((value, key) => {
    mergedHeaders.set(key, value);
  });
  toHeaders(h2).forEach((value, key) => {
    mergedHeaders.set(key, value);
  });

  return mergedHeaders;
}
