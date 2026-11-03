"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { mtFetch } from "@/lib/medtrack/client";
import { GradientHeader, MtButton, MtInput } from "@/components/medtrack/ui";

export default function MedTrackLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("engineer@demo-hospital.local");
  const [password, setPassword] = useState("demo-engineer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await mtFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.message || "Could not sign in");
      return;
    }
    router.replace("/medtrack");
  }

  async function seedDemo() {
    setSeeding(true);
    setError("");
    const res = await mtFetch("/seed", { method: "POST" });
    setSeeding(false);
    if (!res.ok) {
      setError(res.message || "Seed failed — check MySQL env");
      return;
    }
    setEmail("engineer@demo-hospital.local");
    setPassword("demo-engineer");
  }

  return (
    <div className="medtrack-root min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md space-y-4">
        <GradientHeader
          eyebrow="MedTrack QR"
          title="Engineer sign-in"
          description="Hospital field portal for inventory, tickets, schedules, and return-to-service."
        />
        <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-600">Email</span>
            <MtInput
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-600">Password</span>
            <MtInput
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          <MtButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </MtButton>
        </form>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Local demo</p>
          <p className="mt-1">
            Seed a demo hospital, then sign in as{" "}
            <code className="text-xs">engineer@demo-hospital.local</code> /{" "}
            <code className="text-xs">demo-engineer</code>.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            <li>admin@demo-hospital.local / demo-admin</li>
            <li>supervisor@demo-hospital.local / demo-supervisor</li>
            <li>tech@demo-hospital.local / demo-tech</li>
          </ul>
          <MtButton
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={seedDemo}
            disabled={seeding}
          >
            {seeding ? "Seeding…" : "Seed demo hospital"}
          </MtButton>
        </div>
      </div>
    </div>
  );
}
