"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const payload = await response.json();
    setSending(false);
    if (!response.ok) {
      setError(payload.message || "Could not sign in");
      return;
    }
    window.location.assign("/admin");
  }

  return (
    <main className="login-shell">
      <form className="login-card" onSubmit={onSubmit}>
        <img src="/logo.png" alt="Microvision Enterprises Ltd" width={200} height={47} />
        <h1>Admin sign in</h1>
        <label>
          Username or email
          <input name="email" type="text" required autoComplete="username" placeholder="microvision" />
        </label>
        <label>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary" disabled={sending}>
          {sending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
