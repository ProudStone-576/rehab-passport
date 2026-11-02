"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Patients" },
  { href: "/library", label: "Exercise library" },
  { href: "/evaluation", label: "Evaluation" },
  { href: "/about", label: "How it works" },
];

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const { me, saving } = useStore();
  // Patient-facing QR pages and print views get no clinician navigation.
  if (path.startsWith("/e/") || path.endsWith("/print")) return null;
  return (
    <header className="topbar no-print">
      <Link href="/" className="brand">
        <span className="brand-mark">RP</span>
        <span>
          <strong>Rehab Passport</strong>
          <small>QR-assisted home exercise support</small>
        </span>
      </Link>
      <nav>
        {LINKS.map((l) => {
          const on = l.href === "/" ? path === "/" || path.startsWith("/patients") : path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} className={on ? "on" : ""}>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="me">
        <span title={me.email}>{me.demo ? "Demo clinic" : me.name}</span>
        <small>{saving ? "Saving…" : "Saved"}</small>
        <button
          type="button"
          className="link light"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.replace("/login");
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
