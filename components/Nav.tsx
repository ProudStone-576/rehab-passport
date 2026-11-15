"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { useStore } from "@/lib/store";

const LINKS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/patients", label: "Patients", icon: "patients" },
  { href: "/library", label: "Exercise library", icon: "library" },
  { href: "/evaluation", label: "Evaluation", icon: "evaluation" },
  { href: "/about", label: "How it works", icon: "help" },
  { href: "/settings", label: "Clinic settings", icon: "settings" },
];

function isOn(href: string, path: string) {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(href + "/");
}

/**
 * Clinic shell: a navy sidebar on desktop; under 60rem a top bar with a menu
 * button that opens the same sidebar as a drawer. Print views get no chrome.
 */
export default function Nav({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { me, saving } = useStore();
  const [open, setOpen] = useState(false);

  // Close the drawer after navigating.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- route change is an external event
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (path.startsWith("/e/") || path.endsWith("/print")) return <>{children}</>;

  const brand = (
    <Link href="/" className="brand" aria-label="Rehab Passport, dashboard">
      <span className="brand-mark" aria-hidden="true">RP</span>
      <span>
        <strong>Rehab Passport</strong>
        <small>Home exercise passport</small>
      </span>
    </Link>
  );

  return (
    <div className={open ? "shell open" : "shell"}>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="mobile-bar no-print">
        {brand}
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="sidebar" onClick={() => setOpen(true)}>
          <Icon name="menu" label="Open menu" />
        </button>
      </header>
      <aside id="sidebar" className="sidebar no-print" aria-label="Clinic">
        <div className="side-top">
          {brand}
          {open && (
            <button type="button" className="menu-btn" onClick={() => setOpen(false)}>
              <Icon name="close" label="Close menu" />
            </button>
          )}
        </div>
        <nav className="side-nav" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isOn(l.href, path) ? "page" : undefined}>
              <Icon name={l.icon} />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <span className="who" title={me.email}>{me.demo ? "Demo clinic" : me.name}</span>
          <span className="save-state" role="status">
            {saving ? "Saving…" : "All changes saved"}
          </span>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.replace("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      {open && <button type="button" className="scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setOpen(false)} />}
      <main className="page" id="main">{children}</main>
    </div>
  );
}
