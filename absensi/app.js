// --- Pasang tab menu duluan, SEBELUM apa pun yang berhubungan dengan Supabase.
// Kalau config.js salah isi / koneksi Supabase gagal, menu tetap bisa diklik.
const $ = (id) => document.getElementById(id);

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.page).classList.add("active");
    if (btn.dataset.page === "peserta") loadParticipants();
    if (btn.dataset.page === "rekap") loadAttendance();
  });
});

$("toggleImport").addEventListener("click", () => {
  const box = $("importBox");
  box.hidden = !box.hidden;
  $("importChevron").textContent = box.hidden ? "Buka ▾" : "Tutup ▴";
});

$("toggleRekapSettings").addEventListener("click", () => {
  const box = $("rekapSettingsBox");
  box.hidden = !box.hidden;
  $("rekapSettingsChevron").textContent = box.hidden ? "Buka ▾" : "Tutup ▴";
});

// --- Inisialisasi Supabase dibungkus try/catch supaya config.js yang belum
// diisi tidak mematikan seluruh aplikasi.
let db = null;
let configError = "";
try {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import("./config.js");
  if (!SUPABASE_URL || SUPABASE_URL.includes("PROJECT-ID") ||
      !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes("ISI_ANON")) {
    configError = "config.js belum diisi dengan URL & anon key Supabase yang asli.";
  } else {
    const { createClient } = supabase;
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (err) {
  configError = "Gagal memuat config.js: " + err.message;
}

function requireDb(box) {
  if (db) return true;
  if (box) box.innerHTML = `<p class="error">${esc(configError)}</p>`;
  return false;
}

let scanner = null;
let scanning = false;
let lastCode = "";
let lastScanAt = 0;

// ============ QR helper ============

function drawQr(container, text) {
  container.innerHTML = "";
  if (typeof QRCode === "undefined") {
    throw new Error("Library QR gagal dimuat (cek koneksi internet).");
  }
  new QRCode(container, {
    text,
    width: 180,
    height: 180,
    correctLevel: QRCode.CorrectLevel.M
  });
  const canvas = container.querySelector("canvas");
  if (!canvas) throw new Error("QR tidak berhasil digambar di perangkat ini.");
  return canvas;
}

function newKodeQr() {
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
}

// ============ PENGATURAN KARTU ID (judul, sub-judul, logo — tersimpan di browser ini) ============

const CARD_SETTINGS_KEY = "absensiKartuIdSettings";
const defaultCardSettings = { judul: "KKG PJOK SD KEC.TANJUNG", subjudul: "KAB.BREBES", logo: "" };

function loadCardSettings() {
  try {
    const raw = localStorage.getItem(CARD_SETTINGS_KEY);
    if (!raw) return { ...defaultCardSettings };
    return { ...defaultCardSettings, ...JSON.parse(raw) };
  } catch { return { ...defaultCardSettings }; }
}

function saveCardSettingsToStorage(settings) {
  localStorage.setItem(CARD_SETTINGS_KEY, JSON.stringify(settings));
}

let cardSettings = loadCardSettings();

$("cardJudul").value = cardSettings.judul;
$("cardSubjudul").value = cardSettings.subjudul;
if (cardSettings.logo) {
  $("cardLogoPreview").src = cardSettings.logo;
  $("cardLogoPreview").hidden = false;
}

$("toggleCardSettings").addEventListener("click", () => {
  const box = $("cardSettingsBox");
  box.hidden = !box.hidden;
  $("cardSettingsChevron").textContent = box.hidden ? "Buka ▾" : "Tutup ▴";
});

$("cardLogoFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    cardSettings.logo = reader.result;
    $("cardLogoPreview").src = reader.result;
    $("cardLogoPreview").hidden = false;
  };
  reader.readAsDataURL(file);
});

$("cardLogoClear").addEventListener("click", () => {
  cardSettings.logo = "";
  $("cardLogoFile").value = "";
  $("cardLogoPreview").hidden = true;
});

$("cardSettingsSave").addEventListener("click", () => {
  cardSettings.judul = $("cardJudul").value.trim() || defaultCardSettings.judul;
  cardSettings.subjudul = $("cardSubjudul").value.trim() || defaultCardSettings.subjudul;
  saveCardSettingsToStorage(cardSettings);
  alert("Pengaturan kartu disimpan.");
});

// ============ PENGATURAN REKAP & TANDA TANGAN (kecamatan, tempat, ketua KKG, NIP) ============

const REKAP_SETTINGS_KEY = "absensiRekapSettings";
const defaultRekapSettings = {
  judul: "DAFTAR HADIR KKG PJOK SD",
  kecamatan: "TANJUNG",
  tempat: "Tanjung",
  namaKetua: "Candra Nuranto, S.Pd.",
  nipKetua: "199803242024211006"
};

function loadRekapSettings() {
  try {
    const raw = localStorage.getItem(REKAP_SETTINGS_KEY);
    if (!raw) return { ...defaultRekapSettings };
    return { ...defaultRekapSettings, ...JSON.parse(raw) };
  } catch { return { ...defaultRekapSettings }; }
}

function saveRekapSettingsToStorage(settings) {
  localStorage.setItem(REKAP_SETTINGS_KEY, JSON.stringify(settings));
}

let rekapSettings = loadRekapSettings();

$("rekapJudul").value = rekapSettings.judul;
$("rekapKecamatan").value = rekapSettings.kecamatan;
$("rekapTempat").value = rekapSettings.tempat;
$("rekapNamaKetua").value = rekapSettings.namaKetua;
$("rekapNipKetua").value = rekapSettings.nipKetua;

$("rekapSettingsSave").addEventListener("click", () => {
  rekapSettings.judul = $("rekapJudul").value.trim() || defaultRekapSettings.judul;
  rekapSettings.kecamatan = $("rekapKecamatan").value.trim() || defaultRekapSettings.kecamatan;
  rekapSettings.tempat = $("rekapTempat").value.trim() || defaultRekapSettings.tempat;
  rekapSettings.namaKetua = $("rekapNamaKetua").value.trim();
  rekapSettings.nipKetua = $("rekapNipKetua").value.trim();
  saveRekapSettingsToStorage(rekapSettings);
  alert("Pengaturan rekap disimpan.");
});

// ============ FOTO PESERTA (dikompres jadi JPEG kecil, disimpan sebagai base64) ============

function compressImageFile(file, maxDim = 480, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Gagal memuat foto."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.readAsDataURL(file);
  });
}

let pendingFotoDataUrl = "";

$("fotoFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    pendingFotoDataUrl = await compressImageFile(file);
    $("fotoPreview").src = pendingFotoDataUrl;
    $("fotoPreviewRow").hidden = false;
  } catch (err) {
    alert(err.message);
  }
});

$("fotoClearBtn").addEventListener("click", () => {
  pendingFotoDataUrl = "";
  $("fotoFile").value = "";
  $("fotoPreviewRow").hidden = true;
});

// ============ RENDER KARTU ID (canvas, ukuran cetak 5 x 8.5 cm @300dpi) ============

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat logo."));
    img.src = src;
  });
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach(word => {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCardBackground(ctx, w, h) {
  const NAVY = "#123fa8";
  const ORANGE = "#f7a823";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // --- pita dekoratif atas ---
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h * 0.10);
  ctx.quadraticCurveTo(w * 0.65, h * 0.19, w * 0.35, h * 0.09);
  ctx.quadraticCurveTo(w * 0.15, h * 0.03, 0, h * 0.115);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h * 0.045);
  ctx.quadraticCurveTo(w * 0.6, h * 0.11, w * 0.32, h * 0.035);
  ctx.quadraticCurveTo(w * 0.14, 0, 0, h * 0.05);
  ctx.closePath();
  ctx.fill();

  // --- pita dekoratif bawah (cermin dari atas) ---
  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.86);
  ctx.quadraticCurveTo(w * 0.3, h * 0.95, w * 0.55, h * 0.885);
  ctx.quadraticCurveTo(w * 0.8, h * 0.82, w, h * 0.905);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.945);
  ctx.quadraticCurveTo(w * 0.35, h, w * 0.6, h * 0.955);
  ctx.quadraticCurveTo(w * 0.85, h * 0.9, w, h * 0.965);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // --- aksen lingkaran ---
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.arc(w * 0.86, h * 0.335, w * 0.055, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = ORANGE;
  ctx.beginPath();
  ctx.arc(w * 0.17, h * 0.685, w * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

async function renderIdCard(p, settings) {
  const W = 600, H = 1020; // rasio 5 x 8.5 cm, resolusi cetak (300dpi)
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  drawCardBackground(ctx, W, H);

  let cursorY = 150;

  // --- logo (opsional) ---
  if (settings.logo) {
    try {
      const img = await loadImage(settings.logo);
      const r = 62;
      const cx = W / 2, cy = 150;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const size = r * 2;
      const ratio = Math.max(size / img.width, size / img.height);
      const iw = img.width * ratio, ih = img.height * ratio;
      ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
      ctx.restore();
      cursorY = 250;
    } catch {
      cursorY = 170;
    }
  } else {
    cursorY = 170;
  }

  // --- judul ---
  ctx.textAlign = "center";
  ctx.fillStyle = "#123fa8";
  ctx.font = "bold 40px Arial, sans-serif";
  const judulLines = wrapLines(ctx, settings.judul || "", W - 90);
  judulLines.forEach(line => {
    ctx.fillText(line, W / 2, cursorY);
    cursorY += 46;
  });

  // --- sub-judul ---
  cursorY += 10;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 26px Arial, sans-serif";
  const subLines = wrapLines(ctx, settings.subjudul || "", W - 90);
  subLines.forEach(line => {
    ctx.fillText(line, W / 2, cursorY);
    cursorY += 32;
  });

  // --- QR code ---
  // Ukuran QR & badge dipadatkan (dibanding versi sebelumnya) supaya selalu
  // tersedia ruang bersih di pojok kanan bawah untuk foto peserta, tanpa
  // menimpa tulisan nama/sekolah.
  const qrSize = 300;
  const qrY = Math.max(cursorY + 20, 260);
  const tmp = document.createElement("div");
  tmp.style.position = "fixed";
  tmp.style.left = "-9999px";
  document.body.appendChild(tmp);
  try {
    const qrCanvas = drawQr(tmp, p.kode_qr);
    ctx.drawImage(qrCanvas, W / 2 - qrSize / 2, qrY, qrSize, qrSize);
  } finally {
    document.body.removeChild(tmp);
  }

  // --- badge nama + sekolah ---
  const badgeY = qrY + qrSize + 30;
  const badgeH = 100;
  const badgeW = W - 90;
  const badgeX = 45;
  ctx.fillStyle = "#123fa8";
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Arial, sans-serif";
  ctx.fillText(p.nama.toUpperCase(), W / 2, badgeY + 42);
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText((p.asal_sekolah || "-").toUpperCase(), W / 2, badgeY + 76);

  // --- foto peserta (pojok kanan bawah, di bawah badge, gaya kartu contoh) ---
  if (p.foto) {
    try {
      const img = await loadImage(p.foto);
      const photoW = W * 0.42;
      const photoY = badgeY + badgeH + 15;
      const photoH = H - photoY;
      const photoX = W - photoW;
      const r = 40;

      ctx.save();
      photoClipPath(ctx, photoX, photoY, photoW, photoH, r);
      ctx.clip();
      // Skala foto agar menutupi seluruh kotak (cover), lalu sejajarkan ke ATAS
      // (bukan ke tengah) supaya kepala tidak terpotong — hasilnya foto tampil
      // dari atas kepala sampai kira-kira setengah badan, bukan hanya wajah close-up.
      const ratio = Math.max(photoW / img.width, photoH / img.height);
      const iw = img.width * ratio, ih = img.height * ratio;
      const drawX = photoX + photoW / 2 - iw / 2; // tengah secara horizontal
      const drawY = photoY;                        // rata atas secara vertikal
      ctx.drawImage(img, drawX, drawY, iw, ih);
      ctx.restore();

      ctx.save();
      photoClipPath(ctx, photoX, photoY, photoW, photoH, r);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
      ctx.restore();
    } catch (err) {
      console.error("Gagal memuat foto peserta di kartu:", err);
    }
  }

  return canvas;
}

// Bentuk kotak foto: hanya sudut kiri-atas melengkung, sisi kanan & bawah rata
// dengan tepi kartu (meniru gaya kartu ID pada contoh yang diberikan).
function photoClipPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// ============ MODAL PRATINJAU KARTU ID ============

let modalCanvas = null;
let modalFileName = "Kartu_ID.png";

function openCardPreview(canvas, p) {
  modalCanvas = canvas;
  modalFileName = `KartuID_${p.nama.replace(/[^a-z0-9_-]+/gi, "_")}_${p.id}.png`;
  $("cardModalTitle").textContent = `Kartu ID — ${p.nama}`;
  $("cardModalImg").src = canvas.toDataURL("image/png");
  $("cardModal").hidden = false;
}

$("cardModalClose").addEventListener("click", () => { $("cardModal").hidden = true; });
$("cardModal").addEventListener("click", (e) => { if (e.target === $("cardModal")) $("cardModal").hidden = true; });
$("cardModalDownload").addEventListener("click", () => {
  if (!modalCanvas) return;
  downloadCanvas(modalCanvas, modalFileName);
});

// Buat pratinjau mini Kartu ID untuk tiap peserta di Daftar Peserta (di samping QR).
async function renderCardThumbnails(data) {
  for (const p of data) {
    const container = document.getElementById(`cardthumb-${p.id}`);
    if (!container) continue;
    try {
      const canvas = await renderIdCard(p, cardSettings);
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png");
      img.alt = `Kartu ID ${p.nama}`;
      container.innerHTML = "";
      container.appendChild(img);
      container.addEventListener("click", () => openCardPreview(canvas, p));
    } catch (err) {
      container.textContent = "Gagal";
      console.error("Gagal membuat pratinjau kartu untuk", p.nama, err);
    }
  }
}

// ============ PESERTA (list, tambah, edit, hapus) ============

async function loadParticipants() {
  const box = $("participantList");
  if (!requireDb(box)) return;

  box.innerHTML = "Memuat...";
  const { data, error } = await db.from("peserta").select("*").order("nama");
  if (error) return box.innerHTML = `<p class="error">${esc(error.message)}</p>`;
  if (!data.length) return box.innerHTML = "<p>Belum ada peserta.</p>";

  box.innerHTML = data.map(p => `
    <div class="participant" data-id="${p.id}">
      <div class="qr-thumb" id="qr-${p.id}"></div>
      <div class="card-thumb" id="cardthumb-${p.id}" title="Lihat Kartu ID">Memuat...</div>
      <div class="info">
        <div class="view-mode">
          <b>${esc(p.nama)}</b>
          <small>${esc(p.asal_sekolah || "-")}</small>
        </div>
        <div class="edit-mode" hidden>
          <input class="edit-nama" value="${escAttr(p.nama)}" placeholder="Nama peserta">
          <input class="edit-sekolah" value="${escAttr(p.asal_sekolah || "")}" placeholder="Asal sekolah">
          <label class="field-label">Foto (kosongkan jika tidak ingin diganti)</label>
          <input type="file" class="edit-foto" accept="image/*">
          ${p.foto ? `<img class="edit-foto-preview" src="${escAttr(p.foto)}" alt="Foto saat ini">` : ""}
        </div>
      </div>
      <div class="actions">
        <button type="button" class="secondary btn-download">⬇ QR</button>
        <button type="button" class="secondary btn-card">🪪 Kartu ID</button>
        <button type="button" class="secondary btn-edit">✎ Edit</button>
        <button type="button" class="danger btn-delete">🗑 Hapus</button>
        <button type="button" class="primary btn-save" hidden>💾 Simpan</button>
        <button type="button" class="secondary btn-cancel" hidden>✕ Batal</button>
      </div>
    </div>`).join("");

  // Gambar QR untuk tiap peserta
  data.forEach(p => {
    const container = document.getElementById(`qr-${p.id}`);
    try {
      drawQr(container, p.kode_qr);
    } catch (err) {
      const card = container.closest(".participant");
      const info = card.querySelector(".info");
      info.insertAdjacentHTML("beforeend", `<div class="qr-error">QR gagal dibuat: ${esc(err.message)}</div>`);
      card.querySelector(".btn-download").disabled = true;
    }
  });

  // Buat pratinjau mini Kartu ID di samping QR (seperti contoh desain kartu)
  renderCardThumbnails(data);

  // ==== Aksi per kartu (unduh / edit / simpan / batal / hapus) ====
  box.querySelectorAll(".participant").forEach(card => {
    const id = card.dataset.id;
    const viewMode = card.querySelector(".view-mode");
    const editMode = card.querySelector(".edit-mode");
    const btnDownload = card.querySelector(".btn-download");
    const btnCard = card.querySelector(".btn-card");
    const btnEdit = card.querySelector(".btn-edit");
    const btnDelete = card.querySelector(".btn-delete");
    const btnSave = card.querySelector(".btn-save");
    const btnCancel = card.querySelector(".btn-cancel");

    btnDownload.addEventListener("click", () => {
      const canvas = card.querySelector("canvas");
      try {
        const nama = card.querySelector(".edit-nama")?.value || viewMode.querySelector("b").textContent;
        const link = document.createElement("a");
        const namaFile = nama.replace(/[^a-z0-9_-]+/gi, "_");
        link.download = `QR_${namaFile}_${id}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        alert("Gagal mengunduh QR: " + err.message);
      }
    });

    btnCard.addEventListener("click", async () => {
      const original = btnCard.textContent;
      btnCard.textContent = "Membuat...";
      btnCard.disabled = true;
      try {
        const p = data.find(x => String(x.id) === String(id));
        const cardCanvas = await renderIdCard(p, cardSettings);
        const namaFile = p.nama.replace(/[^a-z0-9_-]+/gi, "_");
        downloadCanvas(cardCanvas, `KartuID_${namaFile}_${id}.png`);
      } catch (err) {
        alert("Gagal membuat kartu: " + err.message);
      } finally {
        btnCard.textContent = original;
        btnCard.disabled = false;
      }
    });

    btnEdit.addEventListener("click", () => {
      viewMode.hidden = true; editMode.hidden = false;
      btnEdit.hidden = true; btnDelete.hidden = true; btnDownload.hidden = true;
      btnSave.hidden = false; btnCancel.hidden = false;
    });

    btnCancel.addEventListener("click", () => loadParticipants());

    btnSave.addEventListener("click", async () => {
      const nama = card.querySelector(".edit-nama").value.trim();
      const asal_sekolah = card.querySelector(".edit-sekolah").value.trim();
      if (!nama || !asal_sekolah) return alert("Nama dan asal sekolah wajib diisi.");

      const payload = { nama, asal_sekolah };
      const fotoFile = card.querySelector(".edit-foto")?.files?.[0];
      if (fotoFile) {
        btnSave.textContent = "Memproses foto...";
        btnSave.disabled = true;
        try {
          payload.foto = await compressImageFile(fotoFile);
        } catch (err) {
          btnSave.textContent = "💾 Simpan";
          btnSave.disabled = false;
          return alert(err.message);
        }
      }

      const { error } = await db.from("peserta").update(payload).eq("id", id);
      if (error) {
        btnSave.textContent = "💾 Simpan";
        btnSave.disabled = false;
        return alert("Gagal menyimpan: " + error.message);
      }
      loadParticipants();
    });

    btnDelete.addEventListener("click", async () => {
      const nama = viewMode.querySelector("b").textContent;
      if (!confirm(`Hapus peserta "${nama}"? Riwayat absensinya juga akan terhapus.`)) return;
      const { error } = await db.from("peserta").delete().eq("id", id);
      if (error) return alert("Gagal menghapus: " + error.message);
      loadParticipants();
    });
  });
}

$("downloadAllCards").addEventListener("click", async () => {
  if (!requireDb()) return alert(configError);
  if (typeof JSZip === "undefined") return alert("Library ZIP gagal dimuat (cek koneksi internet).");

  const { data, error } = await db.from("peserta").select("*").order("nama");
  if (error) return alert("Gagal mengambil data peserta: " + error.message);
  if (!data.length) return alert("Belum ada peserta.");

  const btn = $("downloadAllCards");
  const original = btn.textContent;
  const zip = new JSZip();

  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    btn.textContent = `Membuat ${i + 1}/${data.length}...`;
    try {
      const cardCanvas = await renderIdCard(p, cardSettings);
      const blob = await new Promise(res => cardCanvas.toBlob(res, "image/png"));
      const namaFile = p.nama.replace(/[^a-z0-9_-]+/gi, "_");
      zip.file(`KartuID_${namaFile}_${p.id}.png`, blob);
    } catch (err) {
      console.error("Gagal membuat kartu untuk", p.nama, err);
    }
  }

  btn.textContent = "Menyiapkan ZIP...";
  const zipBlob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = "Kartu_ID_Peserta.zip";
  link.click();
  URL.revokeObjectURL(link.href);

  btn.textContent = original;
});

$("participantForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireDb()) return alert(configError);
  const nama = $("nama").value.trim();
  const asal_sekolah = $("sekolah").value.trim();
  if (!nama || !asal_sekolah) return alert("Nama dan asal sekolah wajib diisi.");
  const payload = { nama, asal_sekolah, kode_qr: newKodeQr() };
  if (pendingFotoDataUrl) payload.foto = pendingFotoDataUrl;
  const { error } = await db.from("peserta").insert(payload);
  if (error) return alert(error.message);
  e.target.reset();
  pendingFotoDataUrl = "";
  $("fotoPreviewRow").hidden = true;
  loadParticipants();
  alert("Peserta berhasil disimpan.");
});

// ============ IMPORT MASSAL (Excel/CSV + tempel manual) ============

let pendingImportRows = [];

// Cari nama header kolom yang cocok (fleksibel: "Nama", "nama peserta", dst.)
function findColumn(headerRow, patterns) {
  for (let i = 0; i < headerRow.length; i++) {
    const h = String(headerRow[i] || "").toLowerCase().trim();
    if (patterns.some(p => h.includes(p))) return i;
  }
  return -1;
}

function rowsFromSheet(sheetRows) {
  if (!sheetRows.length) return { rows: [], error: "File kosong." };
  const header = sheetRows[0];
  const namaIdx = findColumn(header, ["nama"]);
  const sekolahIdx = findColumn(header, ["sekolah", "asal"]);
  if (namaIdx === -1 || sekolahIdx === -1) {
    return { rows: [], error: 'Tidak menemukan kolom "Nama" dan "Asal Sekolah" di baris pertama file.' };
  }
  const rows = [];
  for (let i = 1; i < sheetRows.length; i++) {
    const r = sheetRows[i];
    if (!r || !r.length) continue;
    const nama = String(r[namaIdx] ?? "").trim();
    const asal_sekolah = String(r[sekolahIdx] ?? "").trim();
    if (!nama || !asal_sekolah) continue;
    rows.push({ nama, asal_sekolah, kode_qr: newKodeQr() });
  }
  return { rows, error: null };
}

$("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const preview = $("importPreview");
  const importBtn = $("importBtn");
  pendingImportRows = [];
  importBtn.hidden = true;
  if (!file) return;

  if (typeof XLSX === "undefined") {
    preview.innerHTML = `<p class="error">Library Excel gagal dimuat (cek koneksi internet).</p>`;
    return;
  }

  preview.innerHTML = "Membaca file...";
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const sheetRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
    const { rows, error } = rowsFromSheet(sheetRows);
    if (error) {
      preview.innerHTML = `<p class="error">${esc(error)}</p>`;
      return;
    }
    if (!rows.length) {
      preview.innerHTML = `<p class="error">Tidak ada baris data yang valid di file ini.</p>`;
      return;
    }
    pendingImportRows = rows;
    const contoh = rows.slice(0, 5).map(r => `${esc(r.nama)} — ${esc(r.asal_sekolah)}`).join("<br>");
    preview.innerHTML = `<p class="muted">Ditemukan <b>${rows.length}</b> peserta. Contoh:<br>${contoh}${rows.length > 5 ? "<br>..." : ""}</p>`;
    importBtn.hidden = false;
  } catch (err) {
    preview.innerHTML = `<p class="error">Gagal membaca file: ${esc(err.message)}</p>`;
  }
});

$("importBtn").addEventListener("click", async () => {
  if (!requireDb()) return alert(configError);
  if (!pendingImportRows.length) return;
  const resultBox = $("importResult");
  resultBox.textContent = `Mengimport ${pendingImportRows.length} peserta...`;
  const { error } = await db.from("peserta").insert(pendingImportRows);
  if (error) return resultBox.textContent = "Gagal import: " + error.message;
  resultBox.textContent = `Berhasil import ${pendingImportRows.length} peserta.`;
  pendingImportRows = [];
  $("importFile").value = "";
  $("importPreview").innerHTML = "";
  $("importBtn").hidden = true;
  loadParticipants();
});

$("importTextBtn").addEventListener("click", async () => {
  if (!requireDb()) return alert(configError);
  const raw = $("importText").value.trim();
  const resultBox = $("importResult");
  if (!raw) return resultBox.textContent = "Isi daftar peserta dulu.";

  const rows = [];
  const skipped = [];
  raw.split("\n").forEach((line, i) => {
    const clean = line.trim();
    if (!clean) return;
    const parts = clean.split(/;|,/).map(s => s.trim());
    const [nama, asal_sekolah] = parts;
    if (!nama || !asal_sekolah) { skipped.push(i + 1); return; }
    rows.push({ nama, asal_sekolah, kode_qr: newKodeQr() });
  });

  if (!rows.length) return resultBox.textContent = "Tidak ada baris valid. Format: Nama; Asal Sekolah";

  resultBox.textContent = `Mengimport ${rows.length} peserta...`;
  const { error } = await db.from("peserta").insert(rows);
  if (error) return resultBox.textContent = "Gagal import: " + error.message;

  resultBox.textContent = `Berhasil import ${rows.length} peserta.` +
    (skipped.length ? ` Baris dilewati (format salah): ${skipped.join(", ")}.` : "");
  $("importText").value = "";
  loadParticipants();
});

// ============ SCAN ============

async function startScanner() {
  if (scanning) return;
  $("result").textContent = "Membuka kamera...";
  scanner = new Html5Qrcode("reader");
  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      handleScan,
      () => {}
    );
    scanning = true;
    $("result").textContent = "Kamera aktif. Silakan scan QR.";
  } catch (err) {
    $("result").textContent = "Kamera gagal dibuka. Pastikan izin kamera aktif dan gunakan HTTPS.";
  }
}

async function stopScanner() {
  if (!scanner || !scanning) return;
  try { await scanner.stop(); scanner.clear(); } catch {}
  scanning = false;
  $("result").textContent = "Kamera dimatikan.";
}

async function handleScan(code) {
  if (!requireDb()) return showResult(configError, "bad");
  const now = Date.now();
  if (code === lastCode && now - lastScanAt < 3000) return;
  lastCode = code; lastScanAt = now;

  const { data: peserta, error } = await db
    .from("peserta").select("*").eq("kode_qr", code).maybeSingle();

  if (error) return showResult("Gagal membaca data peserta: " + error.message, "bad");
  if (!peserta) return showResult("QR tidak terdaftar.", "bad");

  const today = new Date().toISOString().slice(0,10);
  const { data: existing } = await db
    .from("kehadiran").select("*")
    .eq("peserta_id", peserta.id).eq("tanggal", today).maybeSingle();

  if (existing) {
    return showResult(`⚠️ SUDAH ABSEN<br><b>${esc(peserta.nama)}</b><br>${existing.jam}`, "warn");
  }

  const { error: insertError } = await db.from("kehadiran").insert({
    peserta_id: peserta.id,
    tanggal: today
  });

  if (insertError) return showResult("Gagal menyimpan: " + insertError.message, "bad");
  showResult(`✅ ABSEN BERHASIL<br><b>${esc(peserta.nama)}</b><br>${esc(peserta.asal_sekolah || "-")}`, "ok");
  loadAttendance();
}

function showResult(html, type) {
  $("result").innerHTML = html;
  $("result").className = "result " + type;
}

$("startScan").addEventListener("click", startScanner);
$("stopScan").addEventListener("click", stopScanner);
$("refresh").addEventListener("click", loadAttendance);

// ============ REKAP ============

let attendanceData = [];      // seluruh data kehadiran (semua tanggal)
let attendanceFiltered = [];  // data yang sedang ditampilkan/di-export (sesuai filter tanggal)
let realtimeSubscribed = false;

function formatTanggalPendek(tgl) {
  try {
    return new Date(tgl + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch { return tgl; }
}

// Isi dropdown "Agenda / Tanggal" dari tanggal-tanggal yang ada di data,
// sambil mempertahankan pilihan sebelumnya kalau masih tersedia.
function renderDateFilterOptions() {
  const select = $("rekapDateFilter");
  const prevValue = select.value || "semua";
  const tanggalUnik = [...new Set(attendanceData.map(x => x.tanggal))].sort((a, b) => b.localeCompare(a));

  const opts = [`<option value="semua">Semua tanggal (${attendanceData.length})</option>`];
  tanggalUnik.forEach(t => {
    const jumlah = attendanceData.filter(x => x.tanggal === t).length;
    opts.push(`<option value="${esc(t)}">${esc(formatTanggalPendek(t))} — ${jumlah} orang</option>`);
  });
  select.innerHTML = opts.join("");
  select.value = [prevValue, ...tanggalUnik, "semua"].includes(prevValue) ? prevValue : "semua";
}

function applyAttendanceFilter() {
  const box = $("attendanceList");
  const selected = $("rekapDateFilter").value || "semua";
  attendanceFiltered = selected === "semua"
    ? attendanceData
    : attendanceData.filter(x => x.tanggal === selected);

  if (!attendanceFiltered.length) {
    box.innerHTML = `<tr><td colspan="5">Belum ada data kehadiran untuk pilihan ini.</td></tr>`;
  } else {
    box.innerHTML = attendanceFiltered.map((x, i) => `
      <tr><td>${i + 1}</td><td>${esc(x.peserta?.nama)}</td><td>${esc(x.peserta?.asal_sekolah || "-")}</td>
      <td>${x.tanggal}</td><td>${x.jam}</td></tr>`).join("");
  }
  $("stats").innerHTML = `<div><b>${attendanceFiltered.length}</b><span>Total scan${selected !== "semua" ? " (tanggal ini)" : ""}</span></div>`;
}

$("rekapDateFilter").addEventListener("change", applyAttendanceFilter);

async function loadAttendance() {
  const box = $("attendanceList");
  const btn = $("refresh");
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Memuat...";

  if (!requireDb()) {
    box.innerHTML = `<tr><td colspan="5">${esc(configError)}</td></tr>`;
    btn.disabled = false;
    btn.textContent = originalLabel;
    return;
  }

  try {
    const { data, error } = await db.from("kehadiran")
      .select("id,tanggal,jam,peserta(nama,asal_sekolah)")
      .order("tanggal", { ascending: false }).order("jam", { ascending: false });
    if (error) {
      box.innerHTML = `<tr><td colspan="5">Gagal memuat: ${esc(error.message)}</td></tr>`;
      return;
    }
    attendanceData = data || [];
    renderDateFilterOptions();
    applyAttendanceFilter();
    subscribeRealtimeAttendance();
  } catch (err) {
    box.innerHTML = `<tr><td colspan="5">Gagal memuat data (cek koneksi internet): ${esc(err.message)}</td></tr>`;
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

// Auto-refresh rekap kalau ada absen baru masuk secara realtime (mis. dari HP lain
// yang sedang scan bersamaan), supaya tidak perlu klik Refresh terus-menerus.
function subscribeRealtimeAttendance() {
  if (realtimeSubscribed || !db) return;
  try {
    db.channel("kehadiran-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "kehadiran" }, () => {
        loadAttendance();
      })
      .subscribe();
    realtimeSubscribed = true;
  } catch (err) {
    console.error("Realtime tidak tersedia:", err);
  }
}

// ============ EXPORT PDF REKAP (format daftar hadir cetak) ============

function formatTanggalIndonesia(date) {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

$("downloadRekapPdf").addEventListener("click", () => {
  const btn = $("downloadRekapPdf");
  const rows = attendanceFiltered.length ? attendanceFiltered : attendanceData;
  const selectedTanggal = $("rekapDateFilter").value || "semua";

  if (!rows.length) return alert("Belum ada data kehadiran untuk diunduh.");
  if (typeof window.jspdf === "undefined") {
    return alert("Library PDF gagal dimuat. Pastikan HP/komputer ini terhubung ke internet lalu muat ulang halaman.");
  }

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Menyiapkan PDF...";

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Label tanggal/agenda mengikuti FILTER yang sedang dipilih di halaman Rekap,
    // bukan selalu digabung semua tanggal — sesuai agenda pertemuan yang dipilih.
    let agendaLabel;
    let fileTag;
    if (selectedTanggal === "semua") {
      const years = [...new Set(rows.map(x => (x.tanggal || "").slice(0, 4)).filter(Boolean))].sort();
      agendaLabel = years.length === 1 ? `TAHUN ${years[0]}`
        : years.length > 1 ? `TAHUN ${years[0]} - ${years[years.length - 1]}`
        : `TAHUN ${new Date().getFullYear()}`;
      fileTag = "SemuaTanggal";
    } else {
      agendaLabel = formatTanggalIndonesia(new Date(selectedTanggal + "T00:00:00")).toUpperCase();
      fileTag = selectedTanggal;
    }

    let y = 15;

    if (cardSettings.logo) {
      try {
        const props = doc.getImageProperties(cardSettings.logo);
        const logoW = 18;
        const logoH = (props.height / props.width) * logoW;
        doc.addImage(cardSettings.logo, "PNG", pageW / 2 - logoW / 2, y, logoW, logoH);
        y += logoH + 4;
      } catch (err) {
        console.error("Gagal menambahkan logo ke PDF:", err);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text((rekapSettings.judul || defaultRekapSettings.judul).toUpperCase(), pageW / 2, y, { align: "center" });
    y += 6;
    doc.text(`KECAMATAN ${(rekapSettings.kecamatan || "-").toUpperCase()} — ${agendaLabel}`, pageW / 2, y, { align: "center" });
    y += 8;

    doc.autoTable({
      startY: y,
      head: [["No", "Nama", "Asal Sekolah", "Tanggal", "Jam"]],
      body: rows.map((x, i) => [
        i + 1,
        x.peserta?.nama || "-",
        x.peserta?.asal_sekolah || "-",
        x.tanggal || "-",
        x.jam || "-"
      ]),
      styles: { font: "helvetica", fontSize: 10, cellPadding: 2.2 },
      headStyles: { fillColor: [18, 63, 168], textColor: 255, fontStyle: "bold" },
      margin: { left: 15, right: 15 }
    });

    let finalY = doc.lastAutoTable.finalY + 20;
    if (finalY > 260) { doc.addPage(); finalY = 20; }

    const signX = pageW - 70;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${rekapSettings.tempat || "-"}, ${formatTanggalIndonesia(new Date())}`, signX, finalY);
    doc.text("Ketua KKG PJOK", signX, finalY + 6);

    finalY += 28;
    doc.setFont("helvetica", "bold");
    doc.text(rekapSettings.namaKetua || "-", signX, finalY);
    if (rekapSettings.nipKetua) {
      doc.setFont("helvetica", "normal");
      doc.text(`NIP.${rekapSettings.nipKetua}`, signX, finalY + 6);
    }

    doc.save(`Rekap_Kehadiran_${fileTag}.pdf`);
  } catch (err) {
    console.error("Gagal membuat PDF:", err);
    alert("Gagal membuat PDF: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
});

function esc(v="") {
  return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function escAttr(v="") { return esc(v); }

// Kalau config.js belum diisi, tampilkan pesan begitu halaman dibuka.
if (configError) {
  $("result").textContent = configError;
  $("result").className = "result warn";
}
