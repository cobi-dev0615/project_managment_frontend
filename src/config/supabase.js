import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wqklmnuxvuuzbyalnbcn.supabase.co';
const supabaseAnonKey = 'sb_publishable_GCJtdlVJ3sGc2ZdJwwlVfA_XfBesYkE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
