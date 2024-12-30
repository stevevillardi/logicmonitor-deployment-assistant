import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);

export default supabase; 
export { supabaseBrowser };