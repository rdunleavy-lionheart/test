"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrandMark from "@/components/BrandMark";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/dashboard";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid password");
        setLoading(false);
        return;
      }
      router.replace(from);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="center-wrap">
      <div className="card">
        <div style={{ marginBottom: 24 }}>
          <BrandMark />
        </div>
        <h1>Marketing Allocation</h1>
        <div className="sub">Enter the dashboard password to continue.</div>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn-submit" disabled={loading || !password} type="submit">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {error && <div className="error-msg">{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
