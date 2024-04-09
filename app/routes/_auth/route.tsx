import { Link, Outlet, useLocation } from "@remix-run/react";
import clsx, { type ClassValue } from "clsx";

export default function Page() {
  const appBarHeight = ["h-16", "lg:h-20"];
  const contentsPadding = ["pt-16", "lg:pt-20"];
  return (
    <div>
      <AppBar classes={["z-10", appBarHeight]} />
      <div className="absolute flex flex-row w-full">
        <NavBar navGroups={navGroups} classes={["relative", contentsPadding]} />
        <main className={clsx("grow", contentsPadding)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const AppBar = ({ classes }: { classes?: ClassValue[] }) => (
  <div
    className={clsx(
      "navbar absolute top-0 bg-neutral text-neutral-content shadow-md",
      classes,
    )}
  >
    <Link to="/" className="btn btn-ghost text-xl shadow">
      サンプル
    </Link>
  </div>
);

const NavBar: React.FC<{
  navGroups: NavGroup[];
  classes?: ClassValue[];
}> = ({ navGroups, classes }) => {
  const { pathname } = useLocation();
  return (
    <div
      className={clsx(
        ["bg-base-200"],
        ["shadow-md", "h-screen"],
        ["w-40", "md:w-48", "lg:w-64"],
        classes,
      )}
    >
      {navGroups.map((navGroup, i) => (
        <div key={navGroup.id}>
          {i > 0 && <div className="divider" />}
          <ul
            className={clsx("menu", [
              "menu-sm",
              "md:menu-md",
              "lg:menu-lg",
              "xl:menu-xl",
            ])}
          >
            <li
              className={clsx("menu-title text-base-content", [
                "text-sm",
                "md:text-md",
                "lg:text-lg",
              ])}
            >
              {navGroup.id}
            </li>
            {navGroup.items.map((item) => (
              <li key={item.link}>
                <Link
                  to={item.link}
                  className={clsx(pathname === item.link ? "active" : "")}
                >
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

type NavItem = {
  text: string;
  icon: React.ReactNode;
  link: string;
};

type NavGroup = {
  id: string;
  items: NavItem[];
};

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
      { text: "検索", icon: <Icon />, link: "/about" },
      { text: "設定", icon: <Icon />, link: "/about" },
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

