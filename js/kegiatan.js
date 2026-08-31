// Ambil id dari URL, contoh: kegiatan/?id=2-tanjung-gelar-sparing-voli
// atau kegiatan/?id=3fa85f64-5717-4562-b3fc-2c963f66afa6-tanjung-gelar-sparing-voli
// Bagian judul di belakang cuma buat tampilan URL (SEO/rapi).
// id asli dari Supabase bisa berupa UUID (mengandung banyak strip) atau angka biasa,
// jadi dicek UUID lebih dulu sebelum jatuh ke aturan "sebelum strip pertama".
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('id');
  if (!raw) return null;
  const uuidMatch = raw.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (uuidMatch) return uuidMatch[0];
  const match = raw.match(/^[^-]+/);
  return match ? match[0] : raw;
}

async function renderArticle() {
  const box = document.getElementById('articleBox');
  const related = document.getElementById('relatedGrid');
  const id = getIdFromUrl();

  const [item, allItems] = await Promise.all([
    loadGaleriItemById(id),
    loadGaleriData()
  ]);

  if (!item) {
    box.innerHTML = `
      <span class="m-eyebrow">Tidak ditemukan</span>
      <h1>Kegiatan tidak ditemukan</h1>
      <p class="muted">Link kegiatan tidak valid atau sudah tidak tersedia.</p>
      <a class="btn btn-solid" href="/galeri/">Kembali ke Galeri</a>
    `;
    related.innerHTML = '';
    return;
  }

  document.title = item.title + ' — PAGORA TANJUNG';
  document.getElementById('pageTitle').textContent = item.title + ' — PAGORA TANJUNG';

  // ---- sisipkan foto isi mengambang di sisi teks (gaya koran/majalah) ----
  // biar tampilan berita lebih profesional: foto judul di atas, foto isi
  // mengambang kecil di sisi kiri setelah paragraf pertama, teks membungkus di sekelilingnya.
  const contentImageHtml = item.imageIsi ? `
    <figure class="article-content-image float-left">
      <img src="${item.imageIsi}" alt="${item.captionIsi || item.title}" loading="lazy">
      ${item.captionIsi ? `<figcaption>${item.captionIsi}</figcaption>` : ''}
    </figure>` : '';
  const paragraphs = item.body.map(p => `<p>${p}</p>`);
  const insertAt = paragraphs.length > 1 ? 1 : paragraphs.length;
  const bodyHtml = contentImageHtml
    ? [...paragraphs.slice(0, insertAt), contentImageHtml, ...paragraphs.slice(insertAt)].join('')
    : paragraphs.join('');

  box.innerHTML = `
    <span class="m-eyebrow">${item.tag}</span>
    <h1>${item.title}</h1>
    <div class="article-meta">${item.date}</div>
    <div class="article-hero">
      <div class="article-hero-bg" style="background-image:url('${item.image}')"></div>
      <img src="${item.image}" alt="${item.title}">
    </div>
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
  `;

  komentarInit(item.id);

  const others = allItems.filter(g => String(g.id) !== String(item.id)).slice(0, 3);
  related.innerHTML = others.map(g => `
    <a class="related-card" href="/kegiatan/${buildKegiatanSlugId(g.id, g.title)}/" title="${g.title}" aria-label="${g.title}">
      <div class="related-img" style="background-image:url('${g.image}')"></div>
      <div class="related-img-fg" style="background-image:url('${g.image}')"></div>
      <div class="related-content">
        <span class="tag">${g.tag}</span>
        <span class="title">${g.title}</span>
      </div>
    </a>
  `).join('');
}

renderArticle();
