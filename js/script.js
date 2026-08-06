// mobile menu
const burger = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');
burger.addEventListener('click', () => mobileNav.classList.toggle('open'));
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

// ===================== GALERI: render kartu dari data (Supabase / lokal) =====================
// Setiap kartu jadi link ke kegiatan/?id=... (halaman detail seperti berita)
// Kegiatan baru yang ditambahkan lewat admin.html otomatis muncul di sini.
(async () => {
  const galleryGrid = document.getElementById('galleryGrid');
  if (!galleryGrid) return;

  const items = await loadGaleriData();

  galleryGrid.innerHTML = items.map(g => `
    <a class="g-item ${g.gClass}" data-cat="${g.cat}" href="/kegiatan/${buildKegiatanSlugId(g.id, g.title)}/" title="${g.title}" aria-label="${g.title}">
      <div class="bg" style="background-image:url('${g.image}')"></div>
      <div class="bg-fg" style="background-image:url('${g.image}')"></div>
      <div class="content"><span class="tag">${g.tag}</span><span class="title">${g.title}</span></div>
    </a>
  `).join('');

  // gallery filter (dipasang setelah kartu selesai dirender)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.f;
      document.querySelectorAll('.g-item').forEach(item => {
        item.style.display = (f === 'all' || item.dataset.cat === f) ? 'flex' : 'none';
      });
    });
  });
})();

// ===================== MODAL: RUANG GURU =====================
const WA_LINK = 'https://wa.me/6283838450617';

const ruangGuruData = {
  materi: {
    eyebrow: 'Ruang Guru',
    title: 'Materi Ajar PJOK',
    desc: 'Modul dan RPP siap pakai untuk mendukung pembelajaran PJOK di kelas. Hubungi admin KKG untuk mendapatkan berkas lengkap.',
    items: [
      { name: 'Modul Atletik (Lari, Lompat, Lempar)', sub: 'RPP + bahan ajar', tag: 'PDF' },
      { name: 'Modul Permainan Bola Besar', sub: 'Sepak bola, voli, basket', tag: 'PDF' },
      { name: 'Modul Permainan Bola Kecil', sub: 'Kasti, bulutangkis, tenis meja', tag: 'PDF' },
      { name: 'Modul Senam & Kebugaran Jasmani', sub: 'Untuk kelas 1–6', tag: 'PDF' },
      { name: 'Modul Aktivitas Air (Renang)', sub: 'Materi pengenalan renang', tag: 'PDF' }
    ],
    cta: 'Minta Materi via WhatsApp'
  },
  agenda: {
    eyebrow: 'Ruang Guru',
    title: 'Agenda Pelatihan',
    desc: 'Jadwal kegiatan rutin dan pelatihan anggota KKG PJOK SD Kecamatan Tanjung. Konfirmasi kehadiran melalui WhatsApp admin.',
    items: [
      { name: 'Pelatihan Wasit Sepak Bola', sub: 'Sabtu, minggu ke-1 tiap bulan', tag: 'Rutin' },
      { name: 'Workshop Kurikulum Merdeka PJOK', sub: 'Triwulan berjalan', tag: 'Workshop' },
      { name: 'Sertifikasi Wasit Bulutangkis', sub: 'Jadwal menyusul', tag: 'Sertifikasi' },
      { name: 'Rapat Rutin Anggota KKG', sub: 'Minggu ke-3 tiap bulan', tag: 'Rutin' }
    ],
    cta: 'Tanya Jadwal via WhatsApp'
  },
  forum: {
    eyebrow: 'Ruang Guru',
    title: 'Forum Diskusi',
    desc: 'Forum diskusi anggota KKG PJOK saat ini berjalan melalui grup WhatsApp resmi, tempat berbagi metode mengajar dan tanya jawab antar guru.',
    items: [
      { name: 'Grup WhatsApp Anggota KKG PJOK', sub: 'Diskusi & berbagi pengalaman mengajar', tag: 'Aktif' },
      { name: 'Tanya Jawab Kurikulum & Penilaian', sub: 'Bimbingan langsung dari pengurus', tag: 'Aktif' }
    ],
    cta: 'Gabung Forum via WhatsApp'
  },
  unduhan: {
    eyebrow: 'Ruang Guru',
    title: 'Unduhan Perangkat',
    desc: 'Format administrasi dan perangkat ajar siap pakai untuk kebutuhan mengajar sehari-hari. Berkas dikirim langsung oleh admin melalui WhatsApp.',
    items: [
      { name: 'Format Penilaian Harian & Sumatif', sub: 'Sesuai Kurikulum Merdeka', tag: 'DOCX' },
      { name: 'Format Administrasi Kelas PJOK', sub: 'Presensi, jurnal, catatan', tag: 'DOCX' },
      { name: 'Silabus & Prota-Promes PJOK', sub: 'Semua jenjang kelas', tag: 'DOCX' },
      { name: 'Template RPP Terbaru', sub: 'Format ringkas terbaru', tag: 'DOCX' }
    ],
    cta: 'Minta Berkas via WhatsApp'
  }
};

const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function openModal(html) {
  modalBody.innerHTML = html;
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay) closeModal(); });

document.querySelectorAll('[data-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const data = ruangGuruData[btn.dataset.modal];
    if (!data) return;
    const itemsHtml = data.items.map(it => `
      <li>
        <div><span class="m-name">${it.name}</span><span class="m-sub">${it.sub}</span></div>
        <span class="m-tag">${it.tag}</span>
      </li>`).join('');
    openModal(`
      <span class="m-eyebrow">${data.eyebrow}</span>
      <h3>${data.title}</h3>
      <p>${data.desc}</p>
      <ul class="modal-list">${itemsHtml}</ul>
      <a class="modal-cta" href="${WA_LINK}" target="_blank" rel="noopener">${data.cta}</a>
    `);
  });
});

// scrollspy for dot-nav + top nav
const sections = document.querySelectorAll('section[id]');
const dots = document.querySelectorAll('.dot-nav a');
const navLinks = document.querySelectorAll('nav > ul > li > a');
const spy = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      dots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === '#' + id));
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });
sections.forEach(s => spy.observe(s));

// ===================== HERO SLIDER AUTOMATIC =====================
document.addEventListener('DOMContentLoaded', () => {
  const photos = document.querySelectorAll('.hero-photo-frame .hero-photo');
  
  if (photos.length > 1) {
    let currentIndex = 0;
    
    setInterval(() => {
      // Hapus kelas active dari foto saat ini
      photos[currentIndex].classList.remove('active');
      
      // Pindah ke foto berikutnya secara berulang (loop)
      currentIndex = (currentIndex + 1) % photos.length;
      
      // Tambahkan kelas active pada foto baru
      photos[currentIndex].classList.add('active');
    }, 3500); // Berganti otomatis setiap 3.5 detik
  }
});