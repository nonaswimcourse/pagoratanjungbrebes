// Isi dengan URL dan anon/publishable key project Supabase Anda.
// Jangan gunakan service_role key di browser.
export const SUPABASE_URL = "https://bixyaowckwvjpgwffoci.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_phZErDKE6oDEDN5whvlk3Q_8LpXylcG";

// ============ GOOGLE DRIVE (tombol "Kirim ke Google Drive" di Rekap Kehadiran) ============
// GOOGLE_CLIENT_ID: OAuth 2.0 Client ID (tipe "Web application") dari Google Cloud Console.
// Wajib diisi supaya tombol kirim ke Drive berfungsi. Lihat PANDUAN_GOOGLE_DRIVE.md
// untuk langkah lengkap membuatnya (gratis, sekitar 5 menit).
export const GOOGLE_CLIENT_ID = "903243842649-vavhqhb6q3lm71god0v1lisldtlgj35s.apps.googleusercontent.com";

// GOOGLE_DRIVE_FOLDER_ID: ID folder Google Drive tujuan upload PDF rekap.
// Diambil dari URL folder: https://drive.google.com/drive/folders/<ID_INI>
export const GOOGLE_DRIVE_FOLDER_ID = "18y_rfZKnoyTza9N4ZZ53-Jhd0K8P9DLP";
