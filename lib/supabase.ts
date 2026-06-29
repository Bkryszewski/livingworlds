"use client";
// lib/supabase.ts — passwordless (magic-link) auth + profile sync.
// The browser client reads public env vars (NEXT_PUBLIC_*). The secret
// service-role key is NEVER used here; it lives only in serverless routes.
// If the env vars are missing (e.g. a local build without them), supabase()
// returns null and the app runs in guest-only mode without crashing.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storageKey: "livingworlds:auth",
    },
  });
  return _client;
}

/** Whether sign-in is even available in this build (env vars present). */
export function authAvailable(): boolean {
  return !!supabase();
}

export interface LWProfile {
  name: string;
  email: string;
  language: string;
  pass_tier: string;
  status: string;
  expires: string | null;
}

/** Send a passwordless magic link. Name + language travel as user metadata. */
export async function sendMagicLink(
  email: string,
  name: string,
  language: string
): Promise<void> {
  const sb = supabase();
  if (!sb) throw new Error("auth-unavailable");
  const redirect =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirect, data: { name, language } },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const sb = supabase();
  if (sb) await sb.auth.signOut();
}

/**
 * After a session exists: make sure the person's profile row carries their
 * name + language, then return the profile (including the pass tier the
 * SamCart webhook will set in Phase 2). Returns null if not signed in.
 */
export async function syncProfile(): Promise<LWProfile | null> {
  const sb = supabase();
  if (!sb) return null;

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const meta = (user.user_metadata || {}) as {
    name?: string;
    language?: string;
  };

  // Upsert our own row. The DB trigger usually creates it on signup; this
  // backfills name/language and is safe to run on every sign-in.
  await sb.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      ...(meta.name ? { name: meta.name } : {}),
      ...(meta.language ? { language: meta.language } : {}),
    },
    { onConflict: "id" }
  );

  const { data } = await sb
    .from("profiles")
    .select("name,email,language,pass_tier,status,current_period_end")
    .eq("id", user.id)
    .single();

  return {
    name: (data?.name as string) || meta.name || "",
    email: (data?.email as string) || user.email || "",
    language: (data?.language as string) || meta.language || "en",
    pass_tier: (data?.pass_tier as string) || "guest",
    status: (data?.status as string) || "active",
    expires: (data?.current_period_end as string) || null,
  };
}

// --- Cloud playthroughs (per-account progress + saved cuts) -------------------

export interface CloudPlaythrough {
  world_id: string;
  role_id: string | null;
  ending: string | null;
  clues: number;
  exchanges: number;
  trust: number;
  coverage_score: number | null;
  script: string | null;
  created_at: string;
}

/** Save one finished playthrough to the signed-in person's account. */
export async function saveCloudPlaythrough(row: {
  worldId: string;
  roleId: string | null;
  ending?: string | null;
  clues: number;
  exchanges: number;
  trust: number;
  coverageScore?: number | null;
  script?: string | null;
}): Promise<void> {
  const sb = supabase();
  if (!sb) return;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("playthroughs").insert({
    user_id: user.id,
    world_id: row.worldId,
    role_id: row.roleId,
    ending: row.ending ?? null,
    clues: row.clues,
    exchanges: row.exchanges,
    trust: row.trust,
    coverage_score: row.coverageScore ?? null,
    script: row.script ?? null,
  });
}

/** Load the signed-in person's playthroughs, newest first. */
export async function loadCloudPlaythroughs(): Promise<CloudPlaythrough[]> {
  const sb = supabase();
  if (!sb) return [];
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from("playthroughs")
    .select(
      "world_id,role_id,ending,clues,exchanges,trust,coverage_score,script,created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (data as CloudPlaythrough[]) || [];
}

/** Delete all of the signed-in person's playthroughs (dashboard reset). */
export async function clearCloudPlaythroughs(): Promise<void> {
  const sb = supabase();
  if (!sb) return;
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return;
  await sb.from("playthroughs").delete().eq("user_id", user.id);
}

/**
 * Save a guest lead (email required, name optional) so captured emails are
 * retrievable by the operator. Insert-only by RLS; upsert avoids duplicate-key
 * errors on repeat visits. No-ops gracefully if auth env vars aren't present.
 */
export async function saveLead(lead: {
  email: string;
  name?: string;
  language?: string;
  source?: string;
}): Promise<void> {
  const sb = supabase();
  if (!sb) return;
  const email = lead.email.trim().toLowerCase();
  if (!email) return;
  try {
    await sb
      .from("leads")
      .upsert(
        {
          email,
          name: lead.name?.trim() || null,
          language: lead.language || "en",
          source: lead.source || "perdido",
        },
        { onConflict: "email", ignoreDuplicates: true }
      );
  } catch {
    /* never block play on lead capture */
  }
}