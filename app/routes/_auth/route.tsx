import {
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  json,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import clsx, { type ClassValue } from "clsx";
import type { User } from "lucia";
import type React from "react";
import { useCallback } from "react";

import { getSessionOrRedirect } from "~/lib/auth/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user, session } = await getSessionOrRedirect(request);
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
    <div className="flex-initial text-nowrap text-neutral-content">
      <UserIcon title="user" className="w-6 h-6" />
      {user.username}
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
  const isItemActive = useCallback(
    (item: NavItem) => item.link === pathname,
    [pathname],
  );
  return (
    <div
      className={clsx([
        ["bg-base-200"],
        ["shadow-md", "h-screen", "overflow-auto"],
        ["w-40", "md:w-48", "lg:w-64"],
        ["flex-none"],
        classes,
      ])}
    >
      {navGroups.map((navGroup, i) => (
        <NavGroup
          key={navGroup.id}
          navGroup={navGroup}
          pathname={pathname}
          isItemActive={isItemActive}
          isFirstChild={i === 0}
        />
      ))}
    </div>
  );
};

const NavGroup: React.FC<{
  navGroup: NavGroup;
  pathname: string;
  isFirstChild: boolean;
  isItemActive: (item: NavItem) => boolean;
  classes?: ClassValue[];
}> = ({ navGroup, isFirstChild, isItemActive, classes }) => {
  return (
    <div key={navGroup.id} className={clsx(classes)}>
      {!isFirstChild ? <div className="divider" /> : null}
      <ul
        className={clsx("menu", [
          "menu-sm",
          "md:menu-md",
          "lg:menu-lg",
          "xl:menu-xl",
        ])}
      >
        <li
          className={clsx(
            ["menu-title text-base-content"],
            ["text-sm", "md:text-md", "lg:text-lg"],
          )}
        >
          {navGroup.id}
        </li>
        {navGroup.items.map((item) => (
          <NavItem key={item.link} item={item} active={isItemActive(item)} />
        ))}
      </ul>
    </div>
  );
};

const NavItem: React.FC<{
  item: NavItem;
  active: boolean;
  classes?: ClassValue[];
}> = ({ item, active, classes }) => {
  return (
    <li key={item.link} className={clsx(classes)}>
      <Link to={item.link} className={active ? "active" : ""}>
        <span>{item.icon}</span>
        {item.text}
      </Link>
    </li>
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

const iconStyle = "w-4 h-4";

const navGroups: NavGroup[] = [
  {
    id: "メニュー",
    items: [
      {
        text: "About",
        icon: <InformationCircleIcon title="about" className={iconStyle} />,
        link: "/about",
      },
      {
        text: "検索",
        icon: <MagnifyingGlassIcon title="search" className={iconStyle} />,
        link: "/search",
      },
      {
        text: "設定",
        icon: <Cog6ToothIcon title="config" className={iconStyle} />,
        link: "/config",
      },
    ],
  },
  {
    id: "アカウント",
    items: [
      {
        text: "ログイン",
        icon: (
          <ArrowRightEndOnRectangleIcon title="login" className={iconStyle} />
        ),
        link: "/login",
      },
      {
        text: "ログアウト",
        icon: (
          <ArrowLeftStartOnRectangleIcon title="logout" className={iconStyle} />
        ),
        link: "/logout",
      },
      {
        text: "サインアップ",
        icon: <UserPlusIcon title="signup" className={iconStyle} />,
        link: "/signup",
      },
    ],
  },
];
