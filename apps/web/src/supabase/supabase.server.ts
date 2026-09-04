import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Vite inlines these at build time, and a build with them unset does not fail -- it
// emits `undefined` and produces a bundle that white-screens on `createClient`, from a
// green build. That is the shape of a Cloudflare Pages deploy whose environment
// variables were never set, so say which one is missing rather than leaving a blank
// page and a stack trace inside supabase-js.
if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    `Missing ${!supabaseUrl ? 'VITE_SUPABASE_URL' : 'VITE_SUPABASE_PUBLISHABLE_KEY'}. ` +
    'Add it to apps/web/.env for local development, and to the Pages project\'s ' +
    'environment variables for deployed builds -- both Production and Preview.'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
