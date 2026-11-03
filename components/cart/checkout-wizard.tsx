"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cartTotal, useCartStore } from "@/store/cart";
import { formatKes, makeReference } from "@/lib/utils/format";
import { isEmail, isKenyanPhone, normalizeKenyanPhone } from "@/lib/utils/phone";
import type { PaymentStatus, PlacedOrder } from "@/types";

type Step = 0 | 1 | 2 | 3;

const steps = ["Details", "Delivery", "Payment", "Review"];

interface Details {
  name: string;
  organisation: string;
  role: string;
  phone: string;
  email: string;
  consent: boolean;
}

interface Delivery {
  facility: string;
  town: string;
  notes: string;
  collection: boolean;
}

const control = "mt-1 h-11 w-full rounded-md border border-line bg-surface px-3 text-sm";

export function CheckoutWizard() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const setLastOrder = useCartStore((state) => state.setLastOrder);
  const [step, setStep] = useState<Step>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<Details>({ name: "", organisation: "", role: "", phone: "", email: "", consent: false });
  const [delivery, setDelivery] = useState<Delivery>({ facility: "", town: "", notes: "", collection: false });
  const [method, setMethod] = useState<"mpesa" | "invoice">("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [payment, setPayment] = useState<PaymentStatus | "idle" | "pending">("idle");
  const [receipt, setReceipt] = useState<string | undefined>();

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line bg-surface p-8">
        <h2 className="text-xl">Nothing to check out</h2>
        <Link href="/cart" className="mt-3 inline-flex font-semibold text-brand">Back to cart</Link>
      </div>
    );
  }

  const total = cartTotal(items);
  const example = items.some((item) => item.priceIsPlaceholder);

  function validateDetails() {
    const next: Record<string, string> = {};
    if (!details.name.trim()) next.name = "Enter your name.";
    if (!details.organisation.trim()) next.organisation = "Enter the organisation.";
    if (!details.role.trim()) next.role = "Enter your role.";
    if (!isKenyanPhone(details.phone)) next.phone = "Use a Kenyan number: 07xx, 01xx, or +254.";
    if (!isEmail(details.email)) next.email = "Enter a valid email address.";
    if (!details.consent) next.consent = "Consent is required under the Kenya Data Protection Act.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateDelivery() {
    const next: Record<string, string> = {};
    if (!delivery.collection && !delivery.facility.trim()) next.facility = "Enter the facility, or choose collection.";
    if (!delivery.collection && !delivery.town.trim()) next.town = "Enter the town.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function runStk() {
    const phone = mpesaPhone || details.phone;
    if (!isKenyanPhone(phone)) {
      setErrors({ mpesa: "Enter the M-Pesa number that should receive the prompt." });
      return;
    }
    setErrors({});
    setPayment("pending");
    const normalized = normalizeKenyanPhone(phone) ?? "";
    window.setTimeout(() => {
      if (normalized.endsWith("0000")) {
        setPayment("timeout");
        return;
      }
      if (normalized.endsWith("1111")) {
        setPayment("failed");
        return;
      }
      setReceipt(makeReference("MVO").replace("MVO", "DEMO"));
      setPayment("success");
    }, 1600);
  }

  function placeOrder() {
    const order: PlacedOrder = {
      reference: makeReference("MVO"),
      placedAt: new Date().toISOString(),
      paymentMethod: method,
      paymentStatus: method === "invoice" ? "invoice" : (payment as PaymentStatus),
      mpesaReceipt: receipt,
      name: details.name,
      organisation: details.organisation,
      role: details.role,
      phone: normalizeKenyanPhone(details.phone) ?? details.phone,
      email: details.email,
      facility: delivery.facility,
      town: delivery.town,
      notes: delivery.notes,
      collection: delivery.collection,
      lines: items,
      total,
      includesExamplePrices: example,
    };
    setLastOrder(order);
    clear();
    router.push("/checkout/confirmation");
  }

  const paymentReady = method === "invoice" || payment === "success";

  return (
    <div>
      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Checkout progress">
        {steps.map((label, index) => (
          <li key={label} className={index === step ? "rounded-md bg-brand px-3 py-1 text-sm font-semibold text-on-brand" : index < step ? "rounded-md bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep" : "rounded-md bg-paper-deep px-3 py-1 text-sm text-muted"}>
            <span className="sr-only">{index < step ? "Completed: " : index === step ? "Current: " : ""}</span>
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <form className="max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); if (validateDetails()) setStep(1); }}>
          <Field label="Name" error={errors.name}><input className={control} value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} /></Field>
          <Field label="Organisation" error={errors.organisation}><input className={control} value={details.organisation} onChange={(event) => setDetails({ ...details, organisation: event.target.value })} /></Field>
          <Field label="Role" error={errors.role}><input className={control} value={details.role} onChange={(event) => setDetails({ ...details, role: event.target.value })} /></Field>
          <Field label="Phone" error={errors.phone}><input className={control} inputMode="tel" value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} /></Field>
          <Field label="Email" error={errors.email}><input className={control} type="email" value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} /></Field>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={details.consent} onChange={(event) => setDetails({ ...details, consent: event.target.checked })} />
            <span>I consent to Microvision processing these details for this order, in line with the Kenya Data Protection Act, 2019.</span>
          </label>
          {errors.consent ? <p className="text-sm text-danger">{errors.consent}</p> : null}
          <Button type="submit">Continue to delivery</Button>
        </form>
      ) : null}

      {step === 1 ? (
        <form className="max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); if (validateDelivery()) { setMpesaPhone(details.phone); setStep(2); } }}>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={delivery.collection} onChange={(event) => setDelivery({ ...delivery, collection: event.target.checked })} />
            Collect from Loipi Plaza, Industrial Area
          </label>
          <Field label="Facility" error={errors.facility}><input className={control} value={delivery.facility} onChange={(event) => setDelivery({ ...delivery, facility: event.target.value })} disabled={delivery.collection} /></Field>
          <Field label="Town" error={errors.town}><input className={control} value={delivery.town} onChange={(event) => setDelivery({ ...delivery, town: event.target.value })} disabled={delivery.collection} /></Field>
          <Field label="Notes"><textarea className="mt-1 min-h-24 w-full rounded-md border border-line px-3 py-2 text-sm" value={delivery.notes} onChange={(event) => setDelivery({ ...delivery, notes: event.target.value })} /></Field>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button type="submit">Continue to payment</Button>
          </div>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="max-w-xl space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Payment</legend>
            <label className="flex items-start gap-2 rounded-md border border-line bg-surface p-3 text-sm">
              <input type="radio" name="pay" checked={method === "mpesa"} onChange={() => { setMethod("mpesa"); setPayment("idle"); }} />
              <span><span className="font-semibold">M-Pesa STK push</span><span className="block text-muted">Primary option. This demonstration does not contact Safaricom.</span></span>
            </label>
            <label className="flex items-start gap-2 rounded-md border border-line bg-surface p-3 text-sm">
              <input type="radio" name="pay" checked={method === "invoice"} onChange={() => { setMethod("invoice"); setPayment("invoice"); }} />
              <span><span className="font-semibold">Pay on invoice (institutions)</span><span className="block text-muted">No invoice is issued from this demo.</span></span>
            </label>
          </fieldset>
          {method === "mpesa" ? (
            <div className="rounded-md border border-line bg-surface p-4">
              <p className="text-sm text-muted">Demo only: numbers ending 1111 fail, numbers ending 0000 time out, any other Kenyan number succeeds. No payment is sent.</p>
              <label className="mt-3 block text-sm font-semibold">
                M-Pesa number
                <input className={control} value={mpesaPhone} onChange={(event) => setMpesaPhone(event.target.value)} />
              </label>
              {errors.mpesa ? <p className="mt-2 text-sm text-danger">{errors.mpesa}</p> : null}
              <Button type="button" className="mt-3" onClick={runStk} disabled={payment === "pending"}>
                {payment === "pending" ? "Waiting for the prompt…" : "Send STK push"}
              </Button>
              {payment === "pending" ? <p className="mt-3 text-sm" role="status">Check the phone. This screen is simulating the wait.</p> : null}
              {payment === "success" ? <p className="mt-3 text-sm text-success" role="status">Payment accepted in the demo. Receipt {receipt}.</p> : null}
              {payment === "failed" ? <p className="mt-3 text-sm text-danger" role="alert">The request was declined (demo). Try another number.</p> : null}
              {payment === "timeout" ? <p className="mt-3 text-sm text-warning" role="alert">The prompt timed out (demo). You can send it again.</p> : null}
            </div>
          ) : (
            <p className="rounded-md bg-warning-soft px-3 py-2 text-sm text-warning">Invoice selected. No document is generated.</p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button type="button" disabled={!paymentReady} onClick={() => setStep(3)}>Continue to review</Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="max-w-xl space-y-4">
          <div className="rounded-md border border-line bg-surface p-4 text-sm">
            <p className="font-semibold">{details.name} · {details.organisation}</p>
            <p className="mt-1 text-muted">{details.role} · {details.phone} · {details.email}</p>
            <p className="mt-3">{delivery.collection ? "Collection from Loipi Plaza" : `${delivery.facility}, ${delivery.town}`}</p>
            <ul className="mt-3 space-y-1">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between gap-3">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{item.unitPrice != null ? formatKes(item.unitPrice * item.quantity) : "Quote"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between font-semibold"><span>Total</span><span>{formatKes(total)}</span></p>
            {example ? <p className="mt-2 text-xs text-warning">Example prices are included. This will not charge a phone or raise an invoice.</p> : null}
            <p className="mt-2 text-muted">Payment: {method === "invoice" ? "Pay on invoice (demo)" : `M-Pesa demo ${receipt ?? ""}`}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button type="button" onClick={placeOrder}>Place order</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
      {error ? <span className="mt-1 block text-sm font-normal text-danger">{error}</span> : null}
    </label>
  );
}
