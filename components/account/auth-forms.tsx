"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isEmail } from "@/lib/utils/phone";
import { useAuthStore } from "@/store/auth";

const control = "mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-base";

export function LoginForm() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch("/api/account/login/code", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setError(payload.message || "The login email could not be sent.");
      return;
    }
    setStep("code");
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch("/api/account/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), code: code.trim() }),
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok || !payload.data) {
      setError(payload.message || "That code could not be used.");
      return;
    }
    const customer = payload.data as { name?: string; facilityName?: string; email?: string; phone?: string };
    signIn({
      name: customer.name || email.trim(),
      organisation: customer.facilityName || "",
      role: "Client",
      email: customer.email || email.trim(),
      phone: customer.phone || "",
    });
    router.push("/account");
    router.refresh();
  }

  if (step === "code") {
    return (
      <form onSubmit={verify} className="max-w-md space-y-4">
        <p className="text-sm text-muted">Enter the code sent to {email.trim()}.</p>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <label className="block text-sm font-semibold">
          Login code
          <input
            className={control}
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
        <Button type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        <button
          type="button"
          className="block text-sm font-semibold text-brand"
          onClick={() => {
            setStep("email");
            setCode("");
            setError("");
          }}
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="max-w-md space-y-4" noValidate>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <label className="block text-sm font-semibold">
        Email
        <input
          className={control}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send login code"}</Button>
    </form>
  );
}
