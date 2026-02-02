import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://wqklmnuxvuuzbyalnbcn.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_GCJtdlVJ3sGc2ZdJwwlVfA_XfBesYkE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
