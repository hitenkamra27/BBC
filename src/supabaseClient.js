import { createClient } from "@supabase/supabase-js";

// Primary source: environment variables baked in at build time (see
// .env.example) — this is what Render/production should use.
//
// Secondary source: a runtime override saved from Admin → Settings →
// Supabase connection, stored in this browser's localStorage. This exists
// so a shop owner who can't edit Render's environment variables (or is
// still testing locally) can still point the app at a Supabase project
// from the UI. It only affects the browser it was set in — it does NOT
// change your Render deployment's env vars, and every other visitor's
// browser still falls back to the real env vars.
const OVERRIDE_KEY = "supabase-runtime-config";

function readOverride() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSupabaseOverride() {
  return readOverride();
}

export function setSupabaseOverride(url, anonKey) {
  window.localStorage.setItem(OVERRIDE_KEY, JSON.stringify({ url, anonKey }));
}

export function clearSupabaseOverride() {
  window.localStorage.removeItem(OVERRIDE_KEY);
}

const override = readOverride();
const supabaseUrl = override?.url || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = override?.anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Where the active configuration came from — shown in Admin → Settings so
// the shop owner can tell at a glance whether they're on the real env vars
// or a local override.
export const supabaseConfigSource = override
  ? "admin-panel override (this browser only)"
  : (supabaseUrl ? "environment variables" : "not configured");

if (!supabaseUrl || !supabaseAnonKey) {
  // Not fatal — App.jsx's loadShared/saveShared fall back to localStorage
  // when this is null, so local dev works even without a .env file.
  console.warn(
    "Supabase isn't configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, and no admin-panel override is set). " +
    "Falling back to browser-only storage — data won't sync across devices. See .env.example or Admin → Settings."
  );
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const supabaseUrlInUse = supabaseUrl || "";
