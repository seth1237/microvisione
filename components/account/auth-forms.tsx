"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isEmail, isKenyanPhone, normalizeKenyanPhone } from "@/lib/utils/phone";
import { DEMO_OTP, useAuthStore } from "@/store/auth";

const control = "mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-sm";

export function LoginForm() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const email = identifier.includes("@");
    if (email && !isEmail(identifier)) {
      setError("Enter a valid email or a Kenyan phone number.");
      return;
    }
    if (!email && !isKenyanPhone(identifier)) {
      setError("Enter a valid email or a Kenyan phone number.");
      return;
    }
    if (otpMode) {
      if (otp.trim() !== DEMO_OTP) {
        setError("That demonstration code is not 000000.");
        return;
      }
    } else if (password.trim().length < 6) {
      setError("Use at least 6 characters. This demo accepts any password of that length.");
      return;
    }
    signIn({
      name: "Demo user",
      organisation: "Sample institution",
      role: "Buyer",
      email: email ? identifier.trim() : "buyer@example.com",
      phone: email ? "+254700000000" : (normalizeKenyanPhone(identifier) ?? identifier),
    });
    router.push("/account");
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
      <p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">
        Demonstration sign-in. No message is sent. One-time code: {DEMO_OTP}.
      </p>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <label className="block text-sm font-semibold">
        Email or phone
        <input className={control} value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" />
      </label>
      {otpMode ? (
        <label className="block text-sm font-semibold">
          One-time code
          <input className={control} inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} />
        </label>
      ) : (
        <label className="block text-sm font-semibold">
          Password
          <input className={control} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
      )}
      <Button type="submit">Sign in</Button>
      <button type="button" className="block text-sm font-semibold text-brand" onClick={() => setOtpMode((value) => !value)}>
        {otpMode ? "Use a password instead" : "Use a one-time code instead"}
      </button>
      <p className="text-sm">
        <Link href="/account/reset" className="font-semibold text-brand">Forgot password</Link>
        {" · "}
        <Link href="/account/register" className="font-semibold text-brand">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [form, setForm] = useState({ name: "", organisation: "", role: "", identifier: "", password: "", consent: false });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  function next(event: React.FormEvent) {
    event.preventDefault();
    const email = form.identifier.includes("@");
    if (!form.name.trim() || !form.organisation.trim() || !form.role.trim()) {
      setError("Name, organisation and role are required.");
      return;
    }
    if (email ? !isEmail(form.identifier) : !isKenyanPhone(form.identifier)) {
      setError("Enter a valid email or Kenyan phone number.");
      return;
    }
    if (form.password.trim().length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    if (!form.consent) {
      setError("Consent is required under the Kenya Data Protection Act.");
      return;
    }
    setError("");
    setStep("otp");
  }

  function finish(event: React.FormEvent) {
    event.preventDefault();
    if (otp.trim() !== DEMO_OTP) {
      setError("Enter the demonstration code 000000.");
      return;
    }
    const email = form.identifier.includes("@");
    signIn({
      name: form.name.trim(),
      organisation: form.organisation.trim(),
      role: form.role.trim(),
      email: email ? form.identifier.trim() : "",
      phone: email ? "" : (normalizeKenyanPhone(form.identifier) ?? ""),
    });
    router.push("/account");
  }

  if (step === "otp") {
    return (
      <form onSubmit={finish} className="max-w-md space-y-4">
        <p className="text-sm text-muted">Enter the demonstration code {DEMO_OTP}. Nothing is sent to your phone or email.</p>
        {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
        <label className="block text-sm font-semibold">
          Code
          <input className={control} inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} />
        </label>
        <Button type="submit">Create account</Button>
      </form>
    );
  }

  return (
    <form onSubmit={next} className="max-w-md space-y-4" noValidate>
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      {(["name", "organisation", "role"] as const).map((key) => (
        <label key={key} className="block text-sm font-semibold capitalize">
          {key}
          <input className={control} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
        </label>
      ))}
      <label className="block text-sm font-semibold">
        Email or phone
        <input className={control} value={form.identifier} onChange={(event) => setForm({ ...form, identifier: event.target.value })} />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input className={control} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} />
        <span>I consent to Microvision storing this demonstration profile in this browser, as described in the privacy notice.</span>
      </label>
      <Button type="submit">Continue</Button>
    </form>
  );
}

export function ResetForm() {
  const [step, setStep] = useState<"ask" | "code" | "done">("ask");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="max-w-md space-y-4">
      {step === "done" ? (
        <p className="rounded-md bg-success-soft px-3 py-3 text-sm text-success" role="status">
          Password updated in this demonstration only. <Link href="/account/login" className="font-semibold underline">Sign in</Link>
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const email = identifier.includes("@");
            if (email ? !isEmail(identifier) : !isKenyanPhone(identifier)) {
              setError("Enter a valid email or Kenyan phone number.");
              return;
            }
            if (step === "ask") {
              setError("");
              setStep("code");
              return;
            }
            if (otp.trim() !== DEMO_OTP) {
              setError("Enter the demonstration code 000000.");
              return;
            }
            if (password.trim().length < 6) {
              setError("Use at least 6 characters.");
              return;
            }
            setStep("done");
          }}
        >
          <p className="text-sm text-muted">No reset message is sent. Use code {DEMO_OTP}.</p>
          {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
          <label className="block text-sm font-semibold">
            Email or phone
            <input className={control} value={identifier} onChange={(event) => setIdentifier(event.target.value)} />
          </label>
          {step === "code" ? (
            <>
              <label className="block text-sm font-semibold">
                Code
                <input className={control} value={otp} onChange={(event) => setOtp(event.target.value)} />
              </label>
              <label className="block text-sm font-semibold">
                New password
                <input className={control} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
            </>
          ) : null}
          <Button type="submit">{step === "ask" ? "Continue" : "Update password"}</Button>
        </form>
      )}
    </div>
  );
}
