import { Link, Outlet } from "@remix-run/react";
import clsx, { type ClassValue } from "clsx";

export default function Mui() {
  const appBarHeight = ["h-16", "lg:h-20"];
  const contentsPadding = ["pt-16", "lg:pt-20"];
  return (
    <div>
      <AppBar classes={[appBarHeight]} />
      <div
        className={clsx(
          ["flex", "flex-row"],
          ["ml-10", "md:ml-12", "lg:ml-16", "xl:ml-20", "2xl:ml-24"],
          ["mt-5", "md:mt-6", "lg:mt-8", "xl:mt-10", "2xl:mt-12"],
        )}
      >
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
      "navbar absolute top-0 bg-neutral py-0 text-neutral-content shadow-md",
      classes,
    )}
  >
    <Link to="/" className="btn btn-ghost text-xl shadow">
      サンプル
    </Link>
  </div>
);
