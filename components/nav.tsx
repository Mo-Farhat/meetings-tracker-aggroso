"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
  { href: "/status", label: "Status" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-links">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
