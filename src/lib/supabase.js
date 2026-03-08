import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Read Supabase credentials from (in order): app config (expo.extra), environment variables, or placeholders.
const extra = (Constants.expoConfig && Constants.expoConfig.extra) || (Constants.manifest && Constants.manifest.extra) || {};
const SUPABASE_URL = extra.SUPABASE_URL || process.env.SUPABASE_URL || 'REPLACE_WITH_YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = extra.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';

if (SUPABASE_URL.startsWith('REPLACE') || SUPABASE_ANON_KEY.startsWith('REPLACE')) {
  console.warn('Supabase: no credentials found in app.json (expo.extra) or environment variables. Set SUPABASE_URL and SUPABASE_ANON_KEY to enable Supabase.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signInWithEmail(email) {
  return supabase.auth.signInWithOtp({ email });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function fetchNotesForUser(userId) {
  if (!userId) return [];
  const { data, error } = await supabase.from('notes').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertNoteRemote(note, userId) {
  if (!userId) throw new Error('no user');
  const payload = {
    id: note.id,
    user_id: userId,
    date: note.date,
    text: note.text,
    cards: note.cards || [],
    created_at: note.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('notes').upsert(payload, { returning: 'representation' });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function deleteNoteRemote(id, userId) {
  if (!userId) throw new Error('no user');
  const { error } = await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
  return true;
}
