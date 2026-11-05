"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { isEmail, isKenyanPhone } from "@/lib/utils/phone";
import { useAuthStore } from "@/store/auth";

const control = "mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-base";

type CustomerPayload = { name?: string; facilityName?: string; email?: string; phone?: string };

function rememberCustomer(customer: CustomerPayload, fallbackEmail: string, signIn: ReturnType<typeof useAuthStore.getState>["signIn"]) {
  signIn({
    name: customer.name || fallbackEmail,
    organisation: customer.facilityName || "",
    role: "Client",
    email: customer.email || fallbackEmail,
    phone: customer.phone || "",
  });
}

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
    rememberCustomer(payload.data as CustomerPayload, email.trim(), signIn);
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

export function RegisterForm() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [name, setName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createAccount(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Enter your name.");
      return;
    }
    if (facilityName.trim().length < 2) {
      setError("Enter the facility name.");
      return;
    }
    if (!isKenyanPhone(phone)) {
      setError("Enter a valid Kenyan phone number.");
      return;
    }
    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (location.trim().length < 2) {
      setError("Enter the location.");
      return;
    }
    setBusy(true);
    setError("");
    const response = await fetch("/api/account/register", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        facilityName: facilityName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        location: location.trim(),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok || !payload.data) {
      setError(payload.message || "The account could not be created.");
      return;
    }
    rememberCustomer(payload.data as CustomerPayload, email.trim(), signIn);
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={createAccount} className="max-w-md space-y-4" noValidate>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <label className="block text-sm font-semibold">
        Name
        <input className={control} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        Facility
        <input className={control} autoComplete="organization" value={facilityName} onChange={(event) => setFacilityName(event.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        Phone
        <input className={control} type="tel" autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        Email
        <input className={control} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="block text-sm font-semibold">
        Location
        <input className={control} autoComplete="address-level2" value={location} onChange={(event) => setLocation(event.target.value)} />
      </label>
      <Button type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
    </form>
  );
}

export function AccountAccess({ initial }: { initial: "login" | "register" }) {
  const [panel, setPanel] = useState<"login" | "register">(initial);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Account access">
        <button
          type="button"
          role="tab"
          aria-selected={panel === "login"}
          className={cn("rounded-md px-3 py-2 text-sm font-semibold", panel === "login" ? "bg-brand text-on-brand" : "bg-surface text-ink")}
          onClick={() => setPanel("login")}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={panel === "register"}
          className={cn("rounded-md px-3 py-2 text-sm font-semibold", panel === "register" ? "bg-brand text-on-brand" : "bg-surface text-ink")}
          onClick={() => setPanel("register")}
        >
          Create an account
        </button>
      </div>
      {panel === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
