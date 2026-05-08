/**
 * [CURRICULUM7_NOWPAYMENTS] Server-side helpers for the NOWPayments hosted invoice.
 *
 * - `PLANS` maps the three pricing tiers visible on the landing to their USD
 *   price + checkout copy. Wave 2 charges the up-front course fee (single
 *   course) or the first month (subscription / coach-augmented) at checkout.
 *
 * - `verifyNowpaymentsIpn` is the canonical HMAC-SHA512 verifier copied from
 *   `/Users/keer/projects/prin7r/payments-prototypes/src/lib/signatures.ts`.
 *   The provider posts a JSON body and signs the JSON of the alphabetically
 *   sorted payload with the IPN secret. We never trust an unverified IPN.
 */

import crypto from "node:crypto";
import { MissingEnvError, optionalEnv } from "@/lib/env";

export type PlanId = "single" | "subscription" | "coached";

export type Plan = {
  id: PlanId;
  name: string;
  priceUsd: number;
  cadence: string; // human-readable: "one-time" / "monthly" / etc.
  description: string;
};

export const PLANS: Record<PlanId, Plan> = {
  single: {
    id: "single",
    name: "Curriculum7 — Single course",
    priceUsd: 149,
    cadence: "one-time",
    description:
      "One personalized course, dripped over four weeks. Custom syllabus, weekly readings + exercises, end-of-module evaluations, lifetime access. The whole course built around one declared goal."
  },
  subscription: {
    id: "subscription",
    name: "Curriculum7 — Standing subscription",
    priceUsd: 39,
    cadence: "monthly",
    description:
      "First month of the standing subscription. New course every quarter, refreshed syllabus on demand, library of all your past courses, automatic re-priming when you change your goal."
  },
  coached: {
    id: "coached",
    name: "Curriculum7 — Coach-augmented",
    priceUsd: 299,
    cadence: "monthly",
    description:
      "First month with a human tutor in the loop. Everything in the subscription tier plus a 30-minute weekly call, written feedback on every exercise, and a quarterly course rewrite based on your assessed level."
  }
};

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}

export type CreateInvoiceInput = {
  plan: Plan;
  baseUrl: string;
};

export type NowpaymentsInvoice = {
  id: string;
  invoice_url: string;
  raw: Record<string, unknown>;
};

/**
 * Calls NOWPayments `POST /v1/invoice` to create a hosted invoice and
 * returns the invoice id + redirect URL. Never logs the API key.
 */
export async function createNowpaymentsInvoice(input: CreateInvoiceInput): Promise<NowpaymentsInvoice> {
  const apiKey = optionalEnv("NOWPAYMENTS_API_KEY");
  if (!apiKey) throw new MissingEnvError("NOWPAYMENTS_API_KEY");

  const sandbox = (optionalEnv("NOWPAYMENTS_SANDBOX") ?? "false").toLowerCase() === "true";
  const apiBase = sandbox ? "https://api-sandbox.nowpayments.io" : "https://api.nowpayments.io";

  const orderId = `curriculum7_${input.plan.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const body = {
    price_amount: input.plan.priceUsd,
    price_currency: "usd",
    order_id: orderId,
    order_description: input.plan.description,
    ipn_callback_url: `${input.baseUrl}/api/webhooks/nowpayments`,
    success_url: `${input.baseUrl}/?order=${orderId}&status=paid#hero`,
    cancel_url: `${input.baseUrl}/?order=${orderId}&status=cancelled#hero`,
    is_fee_paid_by_user: false,
    is_fixed_rate: false
  };

  const response = await fetch(`${apiBase}/v1/invoice`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const text = await response.text();
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`NOWPayments returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }

  const invoiceUrl = typeof parsed.invoice_url === "string" ? parsed.invoice_url : "";
  const invoiceId =
    typeof parsed.id === "string" || typeof parsed.id === "number" ? String(parsed.id) : orderId;

  if (!invoiceUrl) {
    throw new Error("NOWPayments response did not include invoice_url");
  }

  return {
    id: invoiceId,
    invoice_url: invoiceUrl,
    raw: parsed
  };
}

/* ------------------------------------------------------------------ */
/* HMAC-SHA512 IPN verification — canonical pattern.                  */
/* ------------------------------------------------------------------ */

function timingSafeEqualHex(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = sortObject((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}

export function verifyNowpaymentsIpn(payload: unknown, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const sorted = JSON.stringify(sortObject(payload));
  const expected = crypto.createHmac("sha512", secret.trim()).update(sorted).digest("hex");
  return timingSafeEqualHex(expected, signature);
}
