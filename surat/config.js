// Config khusus fitur "Kirim ke Google Drive" (Export CSV) di SIAP Tanjung Surat.
// File ini dimuat sebagai <script> biasa (bukan module) sebelum assets/app.js,
// jadi variabelnya otomatis tersedia secara global untuk app.js.
//
// GOOGLE_CLIENT_ID: OAuth 2.0 Client ID (tipe "Web application") dari Google Cloud
// Console. Nilai di bawah ini SAMA dengan yang dipakai di /absensi/config.js,
// jadi tidak perlu membuat Client ID baru.
const GOOGLE_CLIENT_ID = "903243842649-vavhqhb6q3lm71god0v1lisldtlgj35s.apps.googleusercontent.com";

// GOOGLE_DRIVE_FOLDER_ID: ID folder Google Drive tujuan upload CSV.
// Diambil dari URL folder: https://drive.google.com/drive/folders/<ID_INI>
// Nilai di bawah ini untuk sementara SAMA dengan folder tujuan di /absensi/config.js.
// Ganti dengan ID folder Drive lain kapan saja kalau nanti mau dipisah dari absensi.
const GOOGLE_DRIVE_FOLDER_ID = "1CGiZ3PFixRXaGkB0c9LUngwXpGZh0GMs";
