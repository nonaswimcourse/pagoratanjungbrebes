// Isi dengan URL dan anon/publishable key project Supabase Anda.
// Jangan gunakan service_role key di browser.
export const SUPABASE_URL = "https://bixyaowckwvjpgwffoci.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_phZErDKE6oDEDN5whvlk3Q_8LpXylcG";

// ============ DAFTAR EMAIL ADMIN (yang boleh masuk index.html / Absensi Admin) ============
// Supabase Auth menyimpan SEMUA akun (admin & peserta) dalam satu tempat yang sama,
// jadi akun peserta yang dibuatkan untuk "Absen Mandiri" (user.html) SECARA TEKNIS
// bisa saja login di sini juga kalau tidak dibatasi. Daftar di bawah ini adalah
// satu-satunya yang membatasinya: hanya email yang tercantum di sini yang diizinkan
// masuk ke index.html (Absensi Admin). Email lain (termasuk akun peserta) akan
// otomatis DITOLAK & dikeluarkan walau kata sandinya benar, dan tetap bisa login
// normal di user.html.
// Tulis email persis sama seperti saat akun itu dibuat di Supabase (huruf besar/kecil
// tidak masalah, otomatis disamakan). Boleh lebih dari satu, pisahkan dengan koma.
export const ADMIN_EMAILS = [
  "pagoratanjungbrebes@gmail.com",
];

// ============ KODE RAHASIA ADMIN (lapis keamanan tambahan) ============
// Diminta di halaman login index.html (Admin) SEBELUM sistem mengecek email &
// password ke server. Kalau kode ini salah, sistem tidak akan mencoba login sama
// sekali — jadi walau orang lain tahu email & password akun admin, dia tetap tidak
// bisa masuk tanpa tahu kode ini. TIDAK dipakai/tidak diminta di halaman
// Absen Mandiri (user.html), jadi peserta tidak perlu tahu kode ini.
// Ganti dengan kode buatan Anda sendiri (bebas, semakin unik semakin baik).
export const ADMIN_SECRET_CODE = "Akupadamu007@";

// ============ GOOGLE DRIVE (tombol "Kirim ke Google Drive" di Rekap Kehadiran) ============
// GOOGLE_CLIENT_ID: OAuth 2.0 Client ID (tipe "Web application") dari Google Cloud Console.
// Wajib diisi supaya tombol kirim ke Drive berfungsi. Lihat PANDUAN_GOOGLE_DRIVE.md
// untuk langkah lengkap membuatnya (gratis, sekitar 5 menit).
export const GOOGLE_CLIENT_ID = "903243842649-vavhqhb6q3lm71god0v1lisldtlgj35s.apps.googleusercontent.com";

// GOOGLE_DRIVE_FOLDER_ID: ID folder Google Drive tujuan upload PDF rekap.
// Diambil dari URL folder: https://drive.google.com/drive/folders/<ID_INI>
export const GOOGLE_DRIVE_FOLDER_ID = "18y_rfZKnoyTza9N4ZZ53-Jhd0K8P9DLP";
