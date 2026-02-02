import { supabase } from '../config/supabase';

/**
 * Resolve username or email to email for login.
 * If input contains @, treat as email. Otherwise look up via RPC.
 */
async function resolveLoginIdentifier(identifier) {
  const trimmed = (identifier || '').trim();
  if (trimmed.includes('@')) {
    return trimmed;
  }
  const { data, error } = await supabase.rpc('get_email_for_username', {
    uname: trimmed
  });
  if (error || !data) return null;
  return data;
}

export const authService = {
  async login(identifier, password) {
    const email = await resolveLoginIdentifier(identifier);
    if (!email) {
      throw { message: 'User not found. Use your email to sign in, or ensure the profiles setup is complete.' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async register(fullName, username, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: username.trim().toLowerCase()
        }
      }
    });
    if (error) throw error;
    // Profile is created via Supabase trigger (see supabase-setup.sql)
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession() {
    return supabase.auth.getSession();
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
