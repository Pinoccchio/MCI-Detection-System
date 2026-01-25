/**
 * Supabase Client for Client-Side Operations
 *
 * This client is used in Client Components and browser-side code.
 * Uses the NEXT_PUBLIC_ prefixed environment variables which are safe
 * to expose to the browser.
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
