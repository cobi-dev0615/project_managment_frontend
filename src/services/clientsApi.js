import { supabase, supabaseUrl } from '../config/supabase';

const BUCKET = 'avatars';

const handleError = (error) => {
  console.error('Clients API error:', error);
  const err = new Error(error.message || 'An error occurred');
  err.response = { data: { error: err.message } };
  throw err;
};

function getStorageSetupUrl() {
  try {
    const host = new URL(supabaseUrl).hostname;
    const projectRef = host.split('.')[0];
    return `https://supabase.com/dashboard/project/${projectRef}/storage/buckets`;
  } catch {
    return 'https://supabase.com/dashboard';
  }
}

export const clientsApi = {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) handleError(error);
    return data || [];
  },

  async getById(userId, clientId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .eq('id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') handleError(error);
    if (!data) return null;
    return {
      ...data,
      education: data.education || [],
      work_experience: data.work_experience || [],
      portfolios: data.portfolios || [],
    };
  },

  async create(userId, client) {
    const payload = {
      user_id: userId,
      ...client,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('clients')
      .insert(payload)
      .select()
      .single();

    if (error) handleError(error);
    return data;
  },

  async update(userId, clientId, updates) {
    const { education, work_experience, portfolios, ...rest } = updates;
    const payload = { ...rest, updated_at: new Date().toISOString() };
    if (education !== undefined) payload.education = education;
    if (work_experience !== undefined) payload.work_experience = work_experience;
    if (portfolios !== undefined) payload.portfolios = portfolios;

    const { data, error } = await supabase
      .from('clients')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', clientId)
      .select()
      .single();

    if (error) handleError(error);
    return data;
  },

  async delete(userId, clientId) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('user_id', userId)
      .eq('id', clientId);

    if (error) handleError(error);
  },

  async uploadImage(userId, clientId, file) {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/clients/${clientId}/avatar_${Date.now()}.${ext}`;

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

  async uploadPortfolioImage(userId, clientId, portfolioIdx, file) {
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/clients/${clientId}/portfolio_${portfolioIdx}_${Date.now()}.${ext}`;

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
};
