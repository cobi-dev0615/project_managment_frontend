import { supabase, supabaseUrl } from '../config/supabase';

const handleError = (error) => {
  console.error('Profile API error:', error);
  throw { response: { data: { error: error.message || 'An error occurred' } } };
};

const BUCKET = 'avatars';

function getStorageSetupUrl() {
  try {
    const host = new URL(supabaseUrl).hostname;
    const projectRef = host.split('.')[0];
    return `https://supabase.com/dashboard/project/${projectRef}/storage/buckets`;
  } catch {
    return 'https://supabase.com/dashboard';
  }
}

export const profileApi = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') handleError(error);
    return {
      ...data,
      education: data?.education || [],
      work_experience: data?.work_experience || [],
      portfolios: data?.portfolios || [],
    };
  },

  async updateProfile(userId, updates, user = null) {
    const { education, work_experience, portfolios, ...rest } = updates;
    const payload = { ...rest, updated_at: new Date().toISOString() };
    if (education !== undefined) payload.education = education;
    if (work_experience !== undefined) payload.work_experience = work_experience;
    if (portfolios !== undefined) payload.portfolios = portfolios;

    let { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) handleError(error);

    if (!data && user) {
      const email = user.email || updates.email;
      const base = user?.user_metadata?.username || email?.split('@')[0] || 'user';
      const username = `${base}_${userId.replace(/-/g, '').slice(0, 12)}`.toLowerCase().replace(/\W/g, '_');
      const insertPayload = {
        id: userId,
        email: email || 'unknown@local',
        username,
        ...payload,
      };
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .upsert(insertPayload, { onConflict: 'id' })
        .select()
        .single();
      if (insertError) handleError(insertError);
      return inserted;
    }

    if (!data) {
      throw new Error('Profile not found. Please sign out and sign in again.');
    }
    return data;
  },

  async uploadImage(userId, file, path = 'avatar') {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${path}_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: true });

    if (error && (error.message?.includes('Bucket not found') || error.message?.includes('404'))) {
      const setupUrl = getStorageSetupUrl();
      throw new Error(`BUCKET_REQUIRED: ${setupUrl}`);
    }
    if (error) handleError(error);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return publicUrl;
  },

  getStorageSetupUrl,

  async updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) handleError(error);
  },
};
