import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";
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

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}
