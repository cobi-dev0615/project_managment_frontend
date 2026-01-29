import { supabase } from '../config/supabase';

// Helper function to handle Supabase errors
const handleError = (error) => {
  console.error('Supabase error:', error);
  const errorObj = {
    response: {
      data: {
        error: error.message || 'An error occurred'
      }
    }
  };
  throw errorObj;
};

// Types API
export const typesAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('Type')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) handleError(error);
    return { data: data || [] };
  },
  
  create: async (data) => {
    const { data: result, error } = await supabase
      .from('Type')
      .insert([data])
      .select()
      .single();
    
    if (error) handleError(error);
    return { data: result };
  },
  
  update: async (id, data) => {
    const { data: result, error } = await supabase
      .from('Type')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error);
    return { data: result };
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from('Type')
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
    return { data: { message: 'Type deleted successfully' } };
  },
};

// Divisions API
export const divisionsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('Division')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) handleError(error);
    return { data: data || [] };
  },
  
  create: async (data) => {
    const { data: result, error } = await supabase
      .from('Division')
      .insert([data])
      .select()
      .single();
    
    if (error) handleError(error);
    return { data: result };
  },
  
  update: async (id, data) => {
    const { data: result, error } = await supabase
      .from('Division')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleError(error);
    return { data: result };
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from('Division')
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
    return { data: { message: 'Division deleted successfully' } };
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('Project')
      .select(`
        *,
        type:Type(*),
        division:Division(*)
      `)
      .order('createdAt', { ascending: false });
    
    if (error) handleError(error);
    return { data: data || [] };
  },
  
  getById: async (id) => {
    const { data, error } = await supabase
      .from('Project')
      .select(`
        *,
        type:Type(*),
        division:Division(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) handleError(error);
    return { data };
  },
  
  create: async (data) => {
    const { data: result, error } = await supabase
      .from('Project')
      .insert([data])
      .select(`
        *,
        type:Type(*),
        division:Division(*)
      `)
      .single();
    
    if (error) handleError(error);
    return { data: result };
  },
  
  update: async (id, data) => {
    const { data: result, error } = await supabase
      .from('Project')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        type:Type(*),
        division:Division(*)
      `)
      .single();
    
    if (error) handleError(error);
    return { data: result };
  },
  
  delete: async (id) => {
    const { error } = await supabase
      .from('Project')
      .delete()
      .eq('id', id);
    
    if (error) handleError(error);
    return { data: { message: 'Project deleted successfully' } };
  },
};

export default supabase;
