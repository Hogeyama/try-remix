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
import clsx from "clsx";
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
  return (
    <div>
      <AppBar user={user} className={clsx(["z-10", ["h-16", "lg:h-20"]])} />
      <div className="absolute flex w-full flex-row">
        <NavBar
          navGroups={navGroups}
          className={clsx(["relative", ["pt-16", "lg:pt-20"]])}
        />
        <Main className={clsx(["pt-16", "lg:pt-20"])} />
      </div>
    </div>
  );
}

const AppBar = ({ user, className }: { user: User; className?: string }) => (
  <div
    className={clsx(
      "navbar absolute top-0 bg-neutral text-neutral-content shadow-md",
      className,
    )}
  >
    <Link to="/" className="btn btn-ghost text-xl shadow">
      サンプル
    </Link>
    <div className="flex-grow" />
    <div className="flex-initial text-nowrap text-neutral-content">
      <UserIcon title="user" className="h-6 w-6" />
      {user.username}
    </div>
  </div>
);

const Main: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <main className={clsx("grow", "h-screen", "overflow-auto", className)}>
      <Outlet />
    </main>
  );
};

const NavBar: React.FC<{
  navGroups: NavGroup[];
  className?: string;
}> = ({ navGroups, className }) => {
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
        className,
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
  className?: string;
}> = ({ navGroup, isFirstChild, isItemActive, className }) => {
  return (
    <div key={navGroup.id} className={className}>
      {isFirstChild ? null : <div className="divider" />}
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
  className?: string;
}> = ({ item, active, className }) => {
  return (
    <li key={item.link} className={className}>
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
