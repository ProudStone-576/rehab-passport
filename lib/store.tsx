"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { diff, isEmpty } from "./diff";
import type { Data } from "./types";

export type Me = { id: string; name: string; email: string; demo: boolean };

type Store = {
  data: Data;
  me: Me;
  update: (fn: (d: Data) => Data) => void;
  reset: () => Promise<void>;
  refresh: () => Promise<void>;
  saving: boolean;
};

const Ctx = createContext<Store | null>(null);

// Clinician data lives in Postgres. The store keeps one copy in memory, applies
// edits instantly, and sends the changed rows to /api/sync in the background.
// It reloads when the tab regains focus and every 20 s, so ticks a patient
// makes on their phone show up without a manual refresh.
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<{ data: Data; me: Me } | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const pending = useRef(0);
  const current = useRef<Data | null>(null);
  const failed = useRef(false);

  const refresh = useCallback(async () => {
    if (pending.current > 0) return; // don't overwrite edits still being saved
    const res = await fetch("/api/data", { cache: "no-store" }).catch(() => null);
    if (!res) return setError("Can't reach the server. Check your connection.");
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) return setError("Could not load data.");
    const json = (await res.json()) as { data: Data; me: Me };
    if (pending.current > 0) return;
    current.current = json.data;
    setState(json);
    setError("");
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from the server
    refresh();
    const onFocus = () => document.visibilityState === "visible" && refresh();
    const timer = setInterval(onFocus, 20000);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  const update = useCallback(
    (fn: (d: Data) => Data) => {
      const prev = current.current;
      if (!prev) return;
      const next = fn(prev);
      current.current = next;
      setState((s) => (s ? { ...s, data: next } : s));
      const changes = diff(prev, next);
      if (isEmpty(changes)) return;
      pending.current++;
      setSaving(true);
      fetch("/api/sync", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(changes) })
        .then((r) => {
          if (r.status === 401) router.replace("/login");
          else if (!r.ok) throw new Error();
        })
        .catch(() => {
          setError("A change could not be saved. Showing the latest saved data.");
          failed.current = true;
        })
        .finally(() => {
          pending.current--;
          if (pending.current > 0) return;
          setSaving(false);
          if (failed.current) {
            failed.current = false;
            refresh();
          }
        });
    },
    [router, refresh],
  );

  const reset = useCallback(async () => {
    await fetch("/api/reset", { method: "POST" });
    await refresh();
  }, [refresh]);

  if (!state) {
    // Loading: a skeleton in the shape of the shell. Error: what broke and a retry.
    if (error) {
      return (
        <div className="loading" role="alert">
          <p>{error}</p>
          <button type="button" className="btn" onClick={() => location.reload()}>Try again</button>
        </div>
      );
    }
    return (
      <div className="shell" aria-busy="true" aria-label="Loading the clinic">
        <div className="sidebar no-print" />
        <div className="page skeleton">
          <div className="sk sk-title" />
          <div className="sk sk-row" />
          <div className="sk sk-block" />
        </div>
      </div>
    );
  }
  return (
    <Ctx.Provider value={{ data: state.data, me: state.me, update, reset, refresh, saving }}>
      {error && (
        <div className="banner no-print">
          {error} <button type="button" className="link" onClick={() => { setError(""); refresh(); }}>Retry</button>
        </div>
      )}
      {children}
    </Ctx.Provider>
  );
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
