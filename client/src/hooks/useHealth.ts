import { useEffect, useState } from "react";

export type ApiHealth = {
  ok: boolean;
  time?: string;
};

export function useApiHealth(pollMs = 30000) {
  const [status, setStatus] = useState<ApiHealth>({ ok: false });
  const [loading, setLoading] = useState(true);

  // Check if running in static build mode
  const isStaticBuild = import.meta.env.VITE_STATIC_BUILD === "true";

  async function check() {
    // Skip API calls in static build mode
    if (isStaticBuild) {
      setStatus({ ok: false, time: "Static Build" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/health", { credentials: "include" });
      const ok = res.ok;
      const data = ok ? await res.json() : null;
      setStatus({ ok, time: data?.time });
    } catch {
      setStatus({ ok: false });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    check();

    // Don't set up polling in static build mode
    if (isStaticBuild) {
      return;
    }

    const t = setInterval(check, pollMs);
    return () => clearInterval(t);
  }, [pollMs, isStaticBuild]);

  return { status, loading, refresh: check };
}
