// ===================== KONFIGURASI SUPABASE =====================
// 1. Buat project gratis di https://supabase.com
// 2. Buka Project Settings > API, salin "Project URL" dan "anon public" key
// 3. Tempel di bawah ini (menggantikan teks GANTI_...)
// 4. Jalankan file setup.sql di Supabase SQL Editor (lihat PANDUAN-SUPABASE.md)

const SUPABASE_URL = 'https://bixyaowckwvjpgwffoci.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_phZErDKE6oDEDN5whvlk3Q_8LpXylcG';

function isSupabaseConfigured() {
  return !SUPABASE_URL.includes('GANTI_') && !SUPABASE_ANON_KEY.includes('GANTI_');
}

function getSupabaseClient() {
  if (!isSupabaseConfigured() || typeof window.supabase === 'undefined') return null;
  if (!window.__sbClient) {
    window.__sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return window.__sbClient;
}
