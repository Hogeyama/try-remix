import { useRouteLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { loader } from "../_auth/route";

// 各loader, actionはどうせセッションを確認しないといけないので、
// これを使う機会はほとんどないかもしれない。
// （single fetchが有効になったら変わる？）
export const useUserSession = () => {
  const userSession = useRouteLoaderData<typeof loader>("routes/_auth");
  invariant(userSession, "User session not found");
  return userSession;
};

