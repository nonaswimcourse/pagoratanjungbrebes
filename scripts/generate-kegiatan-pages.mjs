// ===================== GENERATOR HALAMAN STATIS KEGIATAN =====================
// Kenapa file ini ada:
// GitHub Pages cuma bisa nyajiin file statis — nggak bisa baca query string
// (?id=...) di server buat nentuin gambar mana yang harus dikirim ke bot
// preview WhatsApp/Facebook/Telegram (bot-bot itu TIDAK menjalankan JavaScript,
// jadi meta tag yang diisi lewat kegiatan.js tidak pernah kebaca mereka).
//
// Solusinya: script ini jalan otomatis (lihat .github/workflows/generate-kegiatan.yml)
// tiap beberapa menit, ambil data kegiatan terbaru dari Supabase, lalu bikin
// SATU FOLDER + index.html ASLI (bukan hasil JS) untuk tiap kegiatan di:
//   /kegiatan/<id>-<judul-slug>/index.html
// Halaman itu sudah punya <meta property="og:image"> yang isinya foto kegiatan
// aslinya, jadi begitu link-nya dibagikan, yang muncul foto berita/kegiatannya
// sendiri — bukan logo, dan bukan cuma link website polos.
//
// Data lokal (js/galeri-data.js) tetap dipakai sebagai cadangan kalau Supabase
// gagal diakses (misal saat develop offline), supaya build tidak pernah gagal total.

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://pagoratanjungbrebes.pro';
const KEGIATAN_DIR = path.join(ROOT, 'kegiatan');

// ---- ambil SUPABASE_URL & SUPABASE_ANON_KEY dari js/supabase-config.js ----
// (satu sumber, biar nggak ada dua tempat yang bisa beda-beda nilainya)
function readSupabaseCreds() {
  const src = readFileSync(path.join(ROOT, 'js', 'supabase-config.js'), 'utf8');
  const url = src.match(/SUPABASE_URL\s*=\s*'([^']+)'/)?.[1];
  const key = src.match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/)?.[1];
  return { url, key };
}

// ---- cadangan kalau Supabase tidak bisa diakses (samakan isinya kalau ubah js/galeri-data.js) ----
const FALLBACK_DATA = [
  { id: 0, kategori: 'pelatihan', judul: 'Pelatihan Wasit Sepak Bola', tanggal: '2026-01-18', gambar: 'assets/img/foto_beranda.jpg', ringkasan: 'Dokumentasi kegiatan pelatihan wasit sepak bola bagi anggota KKG PJOK sebagai bekal memimpin pertandingan antar sekolah.', isi: 'KKG PJOK Kecamatan Tanjung menggelar pelatihan wasit sepak bola yang diikuti oleh puluhan guru PJOK dari berbagai sekolah dasar mitra. Kegiatan ini bertujuan membekali para guru dengan pemahaman aturan permainan terbaru serta teknik memimpin pertandingan secara adil dan tegas di lapangan.\n\nSelain materi peraturan permainan, peserta juga mendapatkan praktik langsung memimpin pertandingan simulasi sehingga lebih siap ketika bertugas sebagai wasit pada kejuaraan maupun pertandingan persahabatan antar sekolah di lingkungan Kecamatan Tanjung.' },
  { id: 1, kategori: 'lomba', judul: 'Kejuaraan Bulutangkis Antar Sekolah', tanggal: '2026-02-02', gambar: 'assets/img/foto_beranda2.jpg', ringkasan: 'Ajang kompetisi bulutangkis antar sekolah yang menjadi wadah unjuk prestasi siswa binaan anggota KKG.', isi: 'Kejuaraan bulutangkis antar sekolah dasar se-Kecamatan Tanjung berlangsung meriah dengan diikuti oleh perwakilan siswa dari sekolah-sekolah mitra KKG PJOK. Ajang ini digagas sebagai wadah unjuk prestasi sekaligus menumbuhkan semangat sportivitas sejak dini.\n\nPara guru PJOK anggota KKG turut berperan aktif sebagai pelatih, wasit, hingga panitia penyelenggara, sehingga kejuaraan dapat berjalan lancar dan menghasilkan bibit-bibit atlet muda yang siap berkembang ke jenjang kompetisi yang lebih tinggi.' },
  { id: 2, kategori: 'acara', judul: 'Jambore Guru PJOK Tanjung', tanggal: '2026-03-14', gambar: 'assets/img/foto_beranda3.jpg', ringkasan: 'Kegiatan kebersamaan tahunan seluruh anggota KKG PJOK SD Kecamatan Tanjung.', isi: 'Jambore Guru PJOK menjadi agenda tahunan yang mempertemukan seluruh anggota KKG PJOK SD Kecamatan Tanjung dalam suasana kekeluargaan. Rangkaian acara diisi dengan berbagai permainan kelompok, diskusi santai, hingga sesi berbagi pengalaman mengajar antar sekolah.\n\nMelalui kegiatan ini, silaturahmi antar guru semakin erat dan semangat kolaborasi dalam mengembangkan pembelajaran PJOK di masing-masing sekolah pun ikut terjaga.' },
  { id: 3, kategori: 'pelatihan', judul: 'Workshop Kurikulum Merdeka', tanggal: '2026-04-05', gambar: 'assets/img/foto_beranda.jpg', ringkasan: 'Workshop pendalaman implementasi Kurikulum Merdeka untuk mata pelajaran PJOK.', isi: 'Workshop ini menghadirkan pembahasan mendalam mengenai implementasi Kurikulum Merdeka khusus untuk mata pelajaran PJOK, mulai dari penyusunan modul ajar, capaian pembelajaran, hingga strategi asesmen yang sesuai dengan karakteristik peserta didik sekolah dasar.\n\nPeserta juga diajak berdiskusi kelompok untuk merancang contoh perangkat ajar yang dapat langsung diterapkan di kelas masing-masing, sehingga hasil workshop benar-benar aplikatif dan tidak berhenti pada teori semata.' },
  { id: 4, kategori: 'lomba', judul: 'Turnamen Bola Voli Guru', tanggal: '2026-04-20', gambar: 'assets/img/foto_beranda2.jpg', ringkasan: 'Turnamen persahabatan bola voli antar guru anggota KKG PJOK Kecamatan Tanjung.', isi: 'Turnamen bola voli antar guru digelar sebagai ajang persahabatan sekaligus menjaga kebugaran jasmani para anggota KKG PJOK. Setiap sekolah mitra mengirimkan tim perwakilannya untuk bertanding dalam suasana yang kompetitif namun tetap penuh keakraban.\n\nSelain mempererat hubungan antar sekolah, turnamen ini juga menjadi sarana bagi para guru untuk saling bertukar strategi permainan yang nantinya bisa diterapkan dalam pembelajaran PJOK di kelas.' },
  { id: 5, kategori: 'acara', judul: 'Halalbihalal & Rapat Anggota', tanggal: '2026-05-10', gambar: 'assets/img/foto_beranda3.jpg', ringkasan: 'Momen silaturahmi dan rapat rutin anggota dalam suasana kekeluargaan.', isi: 'Acara halalbihalal sekaligus rapat rutin anggota KKG PJOK Kecamatan Tanjung berlangsung penuh kehangatan. Selain mempererat tali silaturahmi pasca hari raya, kesempatan ini juga dimanfaatkan untuk membahas program kerja serta evaluasi kegiatan yang telah berjalan.\n\nRapat ditutup dengan penyusunan agenda kegiatan periode berikutnya sebagai bentuk komitmen bersama seluruh anggota untuk terus bergerak dan berdampak bagi dunia pendidikan jasmani di Kecamatan Tanjung.' }
];

async function fetchFromSupabase() {
  const { url, key } = readSupabaseCreds();
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/kegiatan?select=*&order=created_at.desc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch (e) {
    console.warn('[generate-kegiatan-pages] Gagal ambil data Supabase, pakai data cadangan:', e.message);
    return null;
  }
}

const CAT_TO_TAG = { pelatihan: 'Pelatihan', lomba: 'Lomba', acara: 'Acara' };

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildSlugId(id, title) {
  const slug = slugify(title);
  return slug ? `${id}-${slug}` : String(id);
}

function formatTanggalIndonesia(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

function absoluteUrl(p) {
  if (!p) return `${SITE_URL}/assets/img/logo.png`;
  if (/^https?:\/\//i.test(p)) return p;
  return `${SITE_URL}/${String(p).replace(/^\/+/, '')}`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeItem(row, index) {
  const gClasses = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
  return {
    id: row.id,
    gClass: gClasses[index % gClasses.length],
    tag: CAT_TO_TAG[row.kategori] || row.kategori || 'Kegiatan',
    cat: row.kategori,
    title: row.judul,
    date: formatTanggalIndonesia(row.tanggal),
    image: row.gambar,
    excerpt: row.ringkasan || '',
    body: String(row.isi || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  };
}

function renderPage(item, others) {
  const slugId = buildSlugId(item.id, item.title);
  const canonical = `${SITE_URL}/kegiatan/${slugId}/`;
  const ogImage = absoluteUrl(item.image);
  const title = `${item.title} — PAGORA TANJUNG`;
  const desc = (item.excerpt || item.body[0] || '').slice(0, 200);
  const bodyHtml = item.body.map(p => `<p>${escapeHtml(p)}</p>`).join('');

  // ---- link share (Salin Link & WhatsApp) ----
  // waShareUrl dibangun dari `canonical` (bukan window.location.href) supaya
  // apapun cara halaman ini diakses (cache, redirect, dsb), link yang
  // di-share/disalin selalu URL folder /kegiatan/<slug>/ yang benar.
  const waShareText = `${item.title} - ${canonical}`;
  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(waShareText)}`;

  const relatedHtml = others.slice(0, 3).map(g => `
    <a class="related-card" href="/kegiatan/${buildSlugId(g.id, g.title)}/" title="${escapeHtml(g.title)}" aria-label="${escapeHtml(g.title)}">
      <div class="related-img" style="background-image:url('${escapeHtml(g.image)}')"></div>
      <div class="related-img-fg" style="background-image:url('${escapeHtml(g.image)}')"></div>
      <div class="related-content">
        <span class="tag">${escapeHtml(g.tag)}</span>
        <span class="title">${escapeHtml(g.title)}</span>
      </div>
    </a>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#14181a">

<!-- Open Graph: ini yang bikin preview WhatsApp/Facebook/Telegram nampilin
     foto kegiatan aslinya, bukan logo -->
<meta property="og:type" content="article">
<meta property="og:site_name" content="PAGORA TANJUNG">
<meta property="og:title" content="${escapeHtml(item.title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="id_ID">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(item.title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${escapeHtml(ogImage)}">

<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/icons/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css?v=20260729a">
</head>
<body>
<div id="pageLoader" class="page-loader">
  <div class="page-loader-box">
    <img src="/assets/img/logo.png" alt="PAGORA TANJUNG" class="page-loader-logo">
  </div>
  <span class="page-loader-text">PAGORA TANJUNG</span>
  <div class="page-loader-bar"><span></span></div>
</div>

<header>
  <div class="wrap nav-inner">
    <a href="/index.html" class="logo" style="cursor:pointer;">
      <img src="/assets/img/logo.png" alt="Logo KKG PJOK SD Kec. Tanjung" class="logo-img">
      <div class="logo-text">
        <div class="top">PAGORA TANJUNG</div>
        <div class="bottom">KABUPATEN BREBES</div>
      </div>
    </a>
    <div class="nav-right">
      <nav>
        <ul>
          <li><a href="/">Beranda</a></li>
          <li><a href="/profil/">Profil</a></li>
          <li><a href="/ruang-guru/">Ruang Guru</a></li>
          <li><a href="/galeri/" class="active">Galeri Kegiatan</a></li>
          <li><a href="/kontak/">Kontak</a></li>
          <li><a href="/surat/">Siap Tanjung</a></li>
          <li>
            <a class="wa-header-btn" href="https://wa.me/6283838450617" target="_blank" rel="noopener" aria-label="Chat WhatsApp">
              <svg viewBox="0 0 32 32"><use href="#ic-wa"/></svg>
            </a>
          </li>
        </ul>
      </nav>
      <div class="nav-cta">
        <button class="burger" id="burgerBtn" aria-label="Buka menu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </div>
  <div id="mobileNav">
    <a href="/index.html">Beranda</a>
    <a href="/profil/">Profil</a>
    <a href="/ruang-guru/">Ruang Guru</a>
    <a href="/galeri/">Galeri Kegiatan</a>
    <a href="/kontak/">Kontak</a>
    <a href="/surat/">Siap Tanjung</a>
    <a href="https://wa.me/6283838450617" target="_blank" rel="noopener">WhatsApp Kami</a>
  </div>
</header>

<svg width="0" height="0" style="position:absolute">
  <symbol id="ic-wa" viewBox="0 0 32 32"><path d="M16.02 3C9.4 3 4 8.37 4 15c0 2.36.68 4.55 1.86 6.4L4 29l7.8-1.8A11.9 11.9 0 0016.02 27C22.63 27 28 21.63 28 15S22.63 3 16.02 3zm0 21.8c-2.1 0-4.05-.6-5.7-1.65l-.4-.24-4.6 1.07 1.1-4.5-.27-.42a9.65 9.65 0 01-1.55-5.06c0-5.4 4.4-9.8 9.82-9.8 5.4 0 9.8 4.4 9.8 9.8s-4.4 9.8-9.8 9.8zm5.4-7.35c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15s-.78.97-.96 1.17-.35.22-.65.07a7.98 7.98 0 01-2.35-1.45 8.8 8.8 0 01-1.63-2.03c-.17-.3 0-.46.13-.6.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.63-.93-2.24-.24-.58-.5-.5-.68-.5h-.58c-.2 0-.52.07-.8.37s-1.05 1.03-1.05 2.5 1.08 2.9 1.23 3.1c.15.2 2.13 3.25 5.16 4.55.72.3 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35z"/></symbol>
  <symbol id="ic-link" viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 010-1.4l3.2-3.2a3.5 3.5 0 114.95 4.95l-1.8 1.8a1 1 0 11-1.42-1.42l1.8-1.8a1.5 1.5 0 10-2.12-2.12l-3.2 3.2a1 1 0 01-1.41 0zm2.8-2.8a1 1 0 010 1.4l-3.2 3.2a1.5 1.5 0 102.12 2.12l1.8-1.8a1 1 0 111.42 1.42l-1.8 1.8a3.5 3.5 0 11-4.95-4.95l3.2-3.2a1 1 0 011.41 0z"/></symbol>
  <symbol id="ic-check" viewBox="0 0 24 24"><path d="M9.55 17.6 4.4 12.45l1.5-1.5 3.65 3.65 8.55-8.55 1.5 1.5z"/></symbol>
</svg>

<section id="artikel-kegiatan">
  <div class="wrap">
    <a href="/galeri/" class="back-link">← Kembali ke Galeri Kegiatan</a>

    <article id="articleBox" class="article-box">
      <span class="m-eyebrow">${escapeHtml(item.tag)}</span>
      <h1>${escapeHtml(item.title)}</h1>
      <div class="article-meta">${escapeHtml(item.date)}</div>

      <div class="share-box">
        <span class="share-label">Bagikan kegiatan ini</span>
        <div class="share-actions">
          <button type="button" class="share-btn js-copy-link" data-url="${escapeHtml(canonical)}">
            <svg class="ic-default" width="16" height="16" viewBox="0 0 24 24"><use href="#ic-link"/></svg>
            <svg class="ic-copied" width="16" height="16" viewBox="0 0 24 24"><use href="#ic-check"/></svg>
            <span class="share-btn-text">Salin Link</span>
          </button>
          <a class="share-btn share-btn-wa" href="${escapeHtml(waShareUrl)}" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 32 32"><use href="#ic-wa"/></svg>
            <span>Bagikan WhatsApp</span>
          </a>
        </div>
      </div>

      <div class="article-hero"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"></div>
      <div class="article-body">${bodyHtml}</div>

      <div class="comment-box">
        <div class="comment-box-head">
          <h3>Komentar &amp; Rating</h3>
          <div class="comment-avg" id="commentAvg"></div>
        </div>
        <form id="commentForm" class="comment-form">
          <div class="comment-stars-input" role="radiogroup" aria-label="Beri rating bintang">
            <button type="button" class="comment-star-btn" data-val="1" aria-label="1 bintang">★</button>
            <button type="button" class="comment-star-btn" data-val="2" aria-label="2 bintang">★</button>
            <button type="button" class="comment-star-btn" data-val="3" aria-label="3 bintang">★</button>
            <button type="button" class="comment-star-btn" data-val="4" aria-label="4 bintang">★</button>
            <button type="button" class="comment-star-btn" data-val="5" aria-label="5 bintang">★</button>
            <input type="hidden" id="commentRatingValue" value="0">
          </div>
          <input type="text" id="commentNama" class="comment-input" placeholder="Nama kamu" maxlength="60" required>
          <textarea id="commentIsi" class="comment-textarea" rows="3" placeholder="Tulis komentar atau kesan kamu tentang kegiatan ini…" maxlength="500" required></textarea>
          <button type="submit" class="btn btn-solid comment-submit">Kirim Komentar</button>
        </form>
        <div id="commentList" class="comment-list"></div>
      </div>
    </article>

    <div class="related-block">
      <h3>Kegiatan Lainnya</h3>
      <div class="related-grid" id="relatedGrid">${relatedHtml}</div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap" style="text-align:center;">
    <p style="color:rgba(255,255,255,0.6);margin:0;font-size:14px;">
      © 2026 PAGORA TANJUNG
    </p>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/supabase-config.js"></script>
<script src="/js/ui-feedback.js"></script>
<script src="/js/komentar.js"></script>
<script>
  komentarInit(${JSON.stringify(item.id)});

  // ---- Salin Link (selalu pakai URL folder kegiatan yang benar, dari data-url) ----
  document.querySelectorAll('.js-copy-link').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      const url = btn.getAttribute('data-url');
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          const ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.focus();
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        if (window.appToast) appToast('Link kegiatan berhasil disalin!');
        btn.classList.add('copied');
        setTimeout(function () { btn.classList.remove('copied'); }, 1800);
      } catch (err) {
        if (window.appToast) appToast('Gagal menyalin link, coba lagi.', 'error');
      }
    });
  });

  const burger = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
  }
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
</script>
<script src="/js/page-loader.js?v=20260728c"></script>
</body>
</html>
`;
}

async function main() {
  const supabaseRows = await fetchFromSupabase();
  const rows = supabaseRows || FALLBACK_DATA;
  const items = rows.map(normalizeItem);

  if (!existsSync(KEGIATAN_DIR)) mkdirSync(KEGIATAN_DIR, { recursive: true });

  // Hapus folder kegiatan lama (mis. kegiatan yang sudah dihapus di admin)
  // supaya tidak ada halaman basi yang nyangkut, tapi TIDAK menyentuh
  // index.html (halaman fallback lama yang pakai ?id=) atau file lain di /kegiatan/.
  const keep = new Set(items.map(it => buildSlugId(it.id, it.title)));
  for (const entry of readdirSync(KEGIATAN_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && !keep.has(entry.name)) {
      rmSync(path.join(KEGIATAN_DIR, entry.name), { recursive: true, force: true });
    }
  }

  const urls = [];
  for (const item of items) {
    const slugId = buildSlugId(item.id, item.title);
    const others = items.filter(g => String(g.id) !== String(item.id));
    const dir = path.join(KEGIATAN_DIR, slugId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'index.html'), renderPage(item, others), 'utf8');
    urls.push(`${SITE_URL}/kegiatan/${slugId}/`);
  }

  updateSitemap(urls);

  console.log(`[generate-kegiatan-pages] Selesai. ${items.length} halaman kegiatan dibuat (sumber: ${supabaseRows ? 'Supabase' : 'data cadangan lokal'}).`);
  urls.forEach(u => console.log(' -', u));
}

// ---- jaga sitemap.xml tetap sinkron dengan daftar kegiatan yang ada sekarang ----
function updateSitemap(kegiatanUrls) {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (!existsSync(sitemapPath)) return;
  let xml = readFileSync(sitemapPath, 'utf8');

  // buang semua entri /kegiatan/<slug>/ lama (tandai lewat komentar penanda)
  xml = xml.replace(/\n?\s*<!-- KEGIATAN:START -->[\s\S]*?<!-- KEGIATAN:END -->\n?/, '\n');

  const block = `<!-- KEGIATAN:START -->\n${kegiatanUrls.map(u => `  <url>\n    <loc>${u}</loc>\n    <priority>0.6</priority>\n  </url>\n`).join('')}<!-- KEGIATAN:END -->\n`;

  xml = xml.replace('</urlset>', `${block}</urlset>`);
  writeFileSync(sitemapPath, xml, 'utf8');
}

main();
