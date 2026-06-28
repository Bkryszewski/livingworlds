// app/api/samcart-webhook/route.ts — receives SamCart purchase/refund events
// and grants or revokes a time-boxed Festival pass, matched to the buyer by
// EMAIL. Secured by a shared secret in the URL (?token=...). Uses the Supabase
// service-role key, which stays server-side and never reaches the browser.
//
// Because buyers may pay BEFORE signing into the app, the entitlement is
// written to an `entitlements` table keyed by email. When that person later
// signs in, a DB trigger copies it onto their profile. If they already have a
// profile, we also update it directly so the unlock is immediate.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// SamCart product → how many days of access it grants.
// IDs taken from your SamCart products; names are a fallback match.
const PRODUCT_DAYS: Record<string, number> = {
  "1111345": 365, // Festival 1-Year Pass
  "1111349": 30, // Festival 30-Day Pass
};

function daysForProduct(id?: string, name?: string): number | null {
  if (id && PRODUCT_DAYS[id] != null) return PRODUCT_DAYS[id];
  const n = (name || "").toLowerCase();
  if (n.includes("1-year") || n.includes("1 year") || n.includes("1year"))
    return 365;
  if (n.includes("30-day") || n.includes("30 day") || n.includes("30day"))
    return 30;
  return null;
}

// Pull a value from any of several possible payload shapes.
function pick(obj: Record<string, unknown>, paths: string[]): string | undefined {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const key of path.split(".")) {
      if (cur && typeof cur === "object" && key in (cur as object)) {
        cur = (cur as Record<string, unknown>)[key];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string" && cur) return cur;
    if (typeof cur === "number") return String(cur);
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  // 1) Auth: shared secret in the URL.
  const token = req.nextUrl.searchParams.get("token");
  if (!process.env.SAMCART_WEBHOOK_SECRET || token !== process.env.SAMCART_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2) Parse body (SamCart may send JSON or form-encoded).
  let payload: Record<string, unknown> = {};
  try {
    const ctype = req.headers.get("content-type") || "";
    if (ctype.includes("application/json")) {
      payload = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  // Log the raw payload so you can inspect field names in Vercel logs if a
  // match ever fails. (Safe: no secrets, just order data.)
  console.log("samcart-webhook payload:", JSON.stringify(payload));

  // 3) Extract email, product, and event type from common shapes.
  const email = pick(payload, [
    "customer.email",
    "email",
    "customer_email",
    "order.customer.email",
    "data.customer.email",
  ])?.toLowerCase();

  const productId = pick(payload, [
    "product.id",
    "product_id",
    "products.0.id",
    "order.product.id",
    "data.product.id",
  ]);
  const productName = pick(payload, [
    "product.name",
    "product_name",
    "products.0.name",
    "order.product.name",
    "data.product.name",
  ]);

  const eventType = (
    pick(payload, ["type", "event", "event_type", "trigger", "status"]) || ""
  ).toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: true, note: "no email in payload" });
  }

  const isRevoke =
    eventType.includes("refund") ||
    eventType.includes("void") ||
    eventType.includes("chargeback") ||
    eventType.includes("cancel");

  // 4) Supabase admin client (service role — server only).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (isRevoke) {
      // Expire access now.
      const past = new Date(Date.now() - 1000).toISOString();
      await admin
        .from("entitlements")
        .upsert(
          { email, pass_tier: "guest", current_period_end: past, updated_at: new Date().toISOString() },
          { onConflict: "email" }
        );
      await admin
        .from("profiles")
        .update({ pass_tier: "guest", current_period_end: past })
        .eq("email", email);
      return NextResponse.json({ ok: true, action: "revoked", email });
    }

    // Grant: figure out duration from the product.
    const days = daysForProduct(productId, productName);
    if (!days) {
      // Unknown product (e.g. one of your $1.99 story products) — ignore safely.
      return NextResponse.json({ ok: true, note: "non-pass product, ignored" });
    }
    const expires = new Date(Date.now() + days * 86400_000).toISOString();

    await admin
      .from("entitlements")
      .upsert(
        { email, pass_tier: "festival", current_period_end: expires, updated_at: new Date().toISOString() },
        { onConflict: "email" }
      );
    // If they already have a profile, unlock it immediately.
    await admin
      .from("profiles")
      .update({ pass_tier: "festival", current_period_end: expires })
      .eq("email", email);

    return NextResponse.json({ ok: true, action: "granted", email, days });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// A GET handler so you can sanity-check the URL is live in a browser.
export async function GET() {
  return NextResponse.json({ ok: true, route: "samcart-webhook" });
}