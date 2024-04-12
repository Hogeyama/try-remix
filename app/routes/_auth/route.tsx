import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import clsx, { type ClassValue } from "clsx";
import type { User } from "lucia";
import type React from "react";

import { getSessionOrRedirect } from "~/lib/auth/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const [json, { user, session }] = await getSessionOrRedirect(request);
  return json({ user, session });
};

export default function Page() {
  const { user } = useLoaderData<typeof loader>();
  const appBarHeight = ["h-16", "lg:h-20"];
  const contentsPadding = ["pt-16", "lg:pt-20"];
  return (
    <div>
      <AppBar user={user} classes={["z-10", appBarHeight]} />
      <div className="absolute flex flex-row w-full">
        <NavBar navGroups={navGroups} classes={["relative", contentsPadding]} />
        <Main classes={contentsPadding} />
      </div>
    </div>
  );
}

const AppBar = ({ user, classes }: { user: User; classes?: ClassValue[] }) => (
  <div
    className={clsx(
      "navbar absolute top-0 bg-neutral text-neutral-content shadow-md",
      classes,
    )}
  >
    <Link to="/" className="btn btn-ghost text-xl shadow">
      サンプル
    </Link>
    <div className="flex-grow" />
    <div className="flex-initial text-nowrap">
      <div className="btn btn-ghost">Logined as {user.username}</div>
    </div>
  </div>
);

const Main: React.FC<{ classes: ClassValue[] }> = ({ classes }) => {
  return (
    <main className={clsx("grow", "h-screen", "overflow-auto", classes)}>
      <Outlet />
    </main>
  );
};

const NavBar: React.FC<{
  navGroups: NavGroup[];
  classes?: ClassValue[];
}> = ({ navGroups, classes }) => {
  const { pathname } = useLocation();
  const style = {
    container: clsx([
      ["bg-base-200"],
      ["shadow-md", "h-screen", "overflow-auto"],
      ["w-40", "md:w-48", "lg:w-64"],
      ["flex-none"],
      classes,
    ]),
    menu: clsx("menu", ["menu-sm", "md:menu-md", "lg:menu-lg", "xl:menu-xl"]),
    menuTitle: clsx(
      ["menu-title text-base-content"],
      ["text-sm", "md:text-md", "lg:text-lg"],
    ),
    link: (link: string) => (pathname === link ? "active" : ""),
  };
  return (
    <div className={style.container}>
      {navGroups.map((navGroup, i) => (
        <div key={navGroup.id}>
          {i > 0 ? <div className="divider" /> : null}
          <ul className={style.menu}>
            <li className={style.menuTitle}>{navGroup.id}</li>
            {navGroup.items.map((item) => (
              <li key={item.link}>
                <Link to={item.link} className={style.link(item.link)}>
                  <Icon />
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

interface NavItem {
  text: string;
  icon: React.ReactNode;
  link: string;
}

interface NavGroup {
  id: string;
  items: NavItem[];
}

const Icon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <title>Logo</title>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const navGroups: NavGroup[] = [
  {
    id: "メニュー",
    items: [
      { text: "About", icon: <Icon />, link: "/about" },
      { text: "検索", icon: <Icon />, link: "/search" },
      { text: "設定", icon: <Icon />, link: "/config" },
    ],
  },
  {
    id: "アカウント",
    items: [
      { text: "ログイン", icon: <Icon />, link: "/login" },
      { text: "ログアウト", icon: <Icon />, link: "/logout" },
      { text: "サインアップ", icon: <Icon />, link: "/signup" },
    ],
  },
];
