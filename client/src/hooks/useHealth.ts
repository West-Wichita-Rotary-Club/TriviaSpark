import { useEffect, useState } from "react";

export type ApiHealth = {
  ok: boolean;
  time?: string;
};

export function useApiHealth(pollMs = 30000) {
  const [status, setStatus] = useState<ApiHealth>({ ok: false });
  const [loading, setLoading] = useState(true);

  async function check() {
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
    const t = setInterval(check, pollMs);
    return () => clearInterval(t);
  }, [pollMs]);

  return { status, loading, refresh: check };
}
