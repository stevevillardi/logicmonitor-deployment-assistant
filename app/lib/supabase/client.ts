import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create browser client (for client-side usage)
export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
); 