"use client";
import { useState } from "react";

export default function LoginPage() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password })});
    if (res.ok) window.location.href = "/dashboard"; else setErr((await res.json()).error || "Login failed");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-2xl p-6 shadow">
        <h1 className="text-xl font-semibold">AIBUILD Dashboard Login</h1>
        <input className="w-full border rounded p-2" placeholder="Username" value={username} onChange={e=>setU(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={e=>setP(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="w-full rounded-2xl py-2 border hover:shadow">Login</button>
      </form>
    </main>
  );
}