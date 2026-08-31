// ===================== LOADER DATA KEGIATAN =====================
// Sumber data: tabel "kegiatan" di Supabase (online, bisa diisi lewat admin.html).
// Kalau Supabase belum dikonfigurasi (lihat supabase-config.js), pakai data lokal
// dari galeri-data.js supaya situs tetap jalan.

// Ubah judul jadi teks URL yang rapi, contoh:
// "Tanjung Gelar Sparing Voli" -> "tanjung-gelar-sparing-voli"
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // hilangkan aksen/diakritik
    .replace(/[^a-z0-9\s-]/g, '')   // buang karakter selain huruf/angka/spasi/strip
    .trim()
    .replace(/\s+/g, '-')           // spasi jadi strip
    .replace(/-+/g, '-');           // rapikan strip ganda
}

// Gabungkan id asli + judul jadi satu string buat dipakai di URL,
// contoh: buildKegiatanSlugId(2, "Tanjung Gelar Sparing Voli") -> "2-tanjung-gelar-sparing-voli"
function buildKegiatanSlugId(id, title) {
  const slug = slugify(title);
  return slug ? `${id}-${slug}` : String(id);
}

function formatTanggalIndonesia(v) {
  if (!v) return '';
  const d = new Date(v);
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

const CAT_TO_TAG = { pelatihan: 'Pelatihan', lomba: 'Lomba', acara: 'Acara' };

// Pecah kolom "isi" jadi paragraf. Dipisah per baris baru tunggal (bukan
// cuma baris kosong ganda) supaya kalau admin cuma menekan Enter satu kali
// antar paragraf di form, tampilannya tetap rapi jadi paragraf terpisah,
// bukan menumpuk jadi satu blok teks panjang.
// Kalau kosong (mis. kegiatan lama yang belum sempat diisi lengkap),
// tampilkan keterangan alih-alih halaman kosong tanpa penjelasan sama sekali.
function splitParagraf(isi) {
  const parts = String(isi || '').split(/\n+/).map(p => p.trim()).filter(Boolean);
  return parts.length ? parts : ['Isi berita untuk kegiatan ini belum dilengkapi.'];
}

function mapRowToGaleriItem(row, index) {
  const gClasses = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
  return {
    id: row.id,
    gClass: gClasses[index % gClasses.length],
    tag: CAT_TO_TAG[row.kategori] || row.kategori,
    cat: row.kategori,
    title: row.judul,
    date: formatTanggalIndonesia(row.tanggal),
    image: row.gambar,
    imageIsi: row.gambar_isi || row.gambar,
    captionIsi: row.keterangan_isi || '',
    excerpt: row.ringkasan || '',
    body: splitParagraf(row.isi)
  };
}

async function loadGaleriData() {
  const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
  if (!client) {
    return (typeof GALERI_DATA !== 'undefined') ? GALERI_DATA : [];
  }
  try {
    const { data, error } = await client
      .from('kegiatan')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('Gagal ambil data dari Supabase, pakai data lokal.', error);
      return (typeof GALERI_DATA !== 'undefined') ? GALERI_DATA : [];
    }
    return data.map(mapRowToGaleriItem);
  } catch (e) {
    console.warn('Gagal konek ke Supabase, pakai data lokal.', e);
    return (typeof GALERI_DATA !== 'undefined') ? GALERI_DATA : [];
  }
}

async function loadGaleriItemById(id) {
  const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
  if (!client) {
    const local = (typeof GALERI_DATA !== 'undefined') ? GALERI_DATA : [];
    return local.find(g => String(g.id) === String(id)) || null;
  }
  try {
    const { data, error } = await client.from('kegiatan').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapRowToGaleriItem(data, 0);
  } catch (e) {
    return null;
  }
}
