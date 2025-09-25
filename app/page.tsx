"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setU] = useState("admin"); 
  const [password, setP] = useState("admin123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let msg = "Login failed";
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-2xl p-6 shadow">
        <h1 className="text-xl font-semibold">AIBUILD Dashboard Login</h1>
        <input className="w-full border rounded p-2" placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button type="submit" className="w-full rounded-2xl py-2 border hover:shadow" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
