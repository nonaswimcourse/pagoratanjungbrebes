// ===================== KOMENTAR & RATING KEGIATAN =====================
// Menggantikan tombol "Tanya Info Kegiatan Ini" dengan kotak komentar + rating
// bintang yang tersimpan. Kalau tabel Supabase "komentar_kegiatan" sudah
// dibuat (lihat komentar-setup.sql), komentar tersimpan online dan bisa
// dilihat semua orang. Kalau belum, otomatis fallback simpan di browser
// (localStorage) supaya fitur tetap jalan.

const KOMENTAR_LOCAL_KEY = 'pagora_komentar_kegiatan';

function komentarLocalGetAll() {
  try {
    return JSON.parse(localStorage.getItem(KOMENTAR_LOCAL_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function komentarLocalSaveAll(data) {
  try {
    localStorage.setItem(KOMENTAR_LOCAL_KEY, JSON.stringify(data));
  } catch (e) { /* abaikan kalau storage penuh/diblokir */ }
}

async function komentarLoad(kegiatanId) {
  const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
  if (client) {
    try {
      const { data, error } = await client
        .from('komentar_kegiatan')
        .select('*')
        .eq('kegiatan_id', String(kegiatanId))
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    } catch (e) { /* jatuh ke local */ }
  }
  const all = komentarLocalGetAll();
  return (all[String(kegiatanId)] || []).slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function komentarSave(kegiatanId, entry) {
  const client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
  if (client) {
    try {
      const { error } = await client.from('komentar_kegiatan').insert({
        kegiatan_id: String(kegiatanId),
        nama: entry.nama,
        rating: entry.rating,
        komentar: entry.komentar
      });
      if (!error) return true;
    } catch (e) { /* jatuh ke local */ }
  }
  const all = komentarLocalGetAll();
  const list = all[String(kegiatanId)] || [];
  list.push({ ...entry, created_at: new Date().toISOString() });
  all[String(kegiatanId)] = list;
  komentarLocalSaveAll(all);
  return true;
}

function komentarFormatTanggal(iso) {
  try {
    const d = new Date(iso);
    const bulan = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) { return ''; }
}

function komentarStarsHtml(rating, size = 15) {
  let out = '';
  for (let i = 1; i <= 5; i++) {
    out += `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${i <= rating ? 'var(--lime)' : 'none'}" stroke="var(--lime)" stroke-width="1.4"><path d="M12 2.5l2.9 6.02 6.5.63-4.9 4.5 1.35 6.48L12 16.9l-5.85 3.23L7.5 13.65l-4.9-4.5 6.5-.63L12 2.5z"/></svg>`;
  }
  return `<span class="comment-stars-static">${out}</span>`;
}

async function komentarRenderList(kegiatanId) {
  const listBox = document.getElementById('commentList');
  const avgBox = document.getElementById('commentAvg');
  if (!listBox) return;
  listBox.innerHTML = `<p class="muted comment-loading">Memuat komentar…</p>`;

  const items = await komentarLoad(kegiatanId);

  if (!items.length) {
    listBox.innerHTML = `<p class="muted comment-empty">Belum ada komentar. Jadilah yang pertama memberi tanggapan!</p>`;
    if (avgBox) avgBox.innerHTML = '';
    return;
  }

  if (avgBox) {
    const avg = items.reduce((s, it) => s + Number(it.rating || 0), 0) / items.length;
    avgBox.innerHTML = `${komentarStarsHtml(Math.round(avg), 17)}<span class="comment-avg-num">${avg.toFixed(1)} / 5</span><span class="comment-avg-count">(${items.length} ulasan)</span>`;
  }

  listBox.innerHTML = items.map(it => {
    const nama = (it.nama || 'Anonim').replace(/</g, '&lt;');
    const inisial = nama.trim().charAt(0).toUpperCase() || '?';
    return `
    <div class="comment-item">
      <span class="comment-item-quote">&#10078;</span>
      <p class="comment-item-text">${(it.komentar || '').replace(/</g, '&lt;')}</p>
      <div class="comment-item-footer">
        <div class="comment-item-user">
          <div class="comment-item-avatar">${inisial}</div>
          <div>
            <span class="comment-item-name">${nama}</span>
            <span class="comment-item-date">${komentarFormatTanggal(it.created_at)}</span>
          </div>
        </div>
        ${komentarStarsHtml(Number(it.rating || 0))}
      </div>
    </div>
  `;
  }).join('');
}

function komentarInit(kegiatanId) {
  const form = document.getElementById('commentForm');
  if (!form) return;

  let currentRating = 0;
  const starButtons = form.querySelectorAll('.comment-star-btn');
  const ratingInput = document.getElementById('commentRatingValue');

  function paintStars(hoverVal) {
    const val = hoverVal || currentRating;
    starButtons.forEach(btn => {
      const v = Number(btn.dataset.val);
      btn.classList.toggle('is-active', v <= val);
    });
  }

  starButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => paintStars(Number(btn.dataset.val)));
    btn.addEventListener('mouseleave', () => paintStars());
    btn.addEventListener('click', () => {
      currentRating = Number(btn.dataset.val);
      ratingInput.value = currentRating;
      paintStars();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = document.getElementById('commentNama').value.trim();
    const komentar = document.getElementById('commentIsi').value.trim();
    const rating = Number(ratingInput.value || 0);

    if (!rating) {
      if (window.appToast) appToast('Silakan pilih rating bintang dulu ya.', 'error');
      return;
    }
    if (!nama || !komentar) {
      if (window.appToast) appToast('Nama dan komentar wajib diisi.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Mengirim…';

    await komentarSave(kegiatanId, { nama, komentar, rating });

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;

    form.reset();
    currentRating = 0;
    ratingInput.value = 0;
    paintStars();

    if (window.appToast) appToast('Terima kasih, komentar kamu tersimpan!', 'success');
    komentarRenderList(kegiatanId);
  });

  komentarRenderList(kegiatanId);
}
