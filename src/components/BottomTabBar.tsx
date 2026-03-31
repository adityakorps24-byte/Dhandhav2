"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function TabIcon(props: {
  name: "market" | "orders" | "network" | "deals";
  active: boolean;
}) {
  const c = props.active ? "currentColor" : "currentColor";
  const base = props.active ? "opacity-100" : "opacity-70";

  if (props.name === "market") {
    return (
      <svg
        className={base}
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 7h16l-1.2 12.2A2 2 0 0 1 16.8 21H7.2a2 2 0 0 1-2-1.8L4 7Z"
          stroke={c}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 9V6a3 3 0 0 1 6 0v3"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (props.name === "orders") {
    return (
      <svg
        className={base}
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7 3h10a2 2 0 0 1 2 2v16l-4-2-3 2-3-2-4 2V5a2 2 0 0 1 2-2Z"
          stroke={c}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 8h7"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8.5 12h7"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (props.name === "network") {
    return (
      <svg
        className={base}
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 11a4 4 0 1 0-8 0"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M5 21a7 7 0 0 1 14 0"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="9" r="3" stroke={c} strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg
      className={base}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 12c0 5-3.6 9-8 9s-8-4-8-9 3.6-9 8-9 8 4 8 9Z"
        stroke={c}
        strokeWidth="2"
      />
      <path
        d="M8.5 12h7"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 8.5v7"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomTabBar() {
  const pathname = usePathname() || "/";

  const tabs = [
    { href: "/market", label: "Market", icon: "market" as const },
    { href: "/orders", label: "Orders", icon: "orders" as const },
    { href: "/network", label: "Network", icon: "network" as const },
    { href: "/deals", label: "Deals", icon: "deals" as const },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-blue-100 bg-white/85 backdrop-blur sm:hidden">
      <div className="mx-auto w-full max-w-5xl px-4 py-2">
        <div className="dh-card-soft grid grid-cols-4 rounded-3xl p-2">
          {tabs.map((t) => {
            const active = isActivePath(pathname, t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  active
                    ? "rounded-2xl bg-blue-600 px-2 py-2 text-white"
                    : "rounded-2xl px-2 py-2 text-blue-800"
                }
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <TabIcon name={t.icon} active={active} />
                  <div
                    className={
                      active
                        ? "text-[11px] font-extrabold"
                        : "text-[11px] font-bold text-blue-900"
                    }
                  >
                    {t.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
