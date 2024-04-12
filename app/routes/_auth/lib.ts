import { useRouteLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { loader } from "./route";

export const useUserSession = () => {
  const userSession = useRouteLoaderData<typeof loader>("routes/_auth");
  invariant(userSession, "User session not found");
  return userSession;
};
