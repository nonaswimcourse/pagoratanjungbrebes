// --- Pasang tab menu duluan, SEBELUM apa pun yang berhubungan dengan Supabase.
// Kalau config.js salah isi / koneksi Supabase gagal, menu tetap bisa diklik.
const $ = (id) => document.getElementById(id);

// Logo resmi bawaan KKG PJOK SD Kec. Tanjung (dipakai default di Kartu ID & PDF Rekap,
// bisa diganti lewat menu Pengaturan Kartu ID kalau perlu logo lain).
const DEFAULT_LOGO_DATA_URL = "data:image/png;base64,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";

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

// ============ AUTH (Supabase) ============
// Aplikasi hanya bisa dipakai setelah user login. Sesi dicek saat halaman
// dibuka, dan UI otomatis berpindah login/app lewat onAuthStateChange.
const authScreen = $("authScreen");
const mainApp = $("mainApp");
const loginForm = $("loginForm");
const authMsg = $("authMsg");
const loginBtn = $("loginBtn");
const authEmailInput = $("authEmail");
const authPasswordInput = $("authPassword");
const authUserEmail = $("authUserEmail");
const logoutBtn = $("logoutBtn");

function showAuthMsg(text, type = "bad") {
  authMsg.hidden = false;
  authMsg.textContent = text;
  authMsg.className = "result " + type;
}

let currentSession = null;

function applyAuthUI(session) {
  currentSession = session;
  if (session && session.user) {
    authScreen.hidden = true;
    mainApp.hidden = false;
    authUserEmail.textContent = session.user.email || "";
    // Muat ulang data untuk tab yang sedang aktif setiap kali status login berubah
    const activeTab = document.querySelector(".tab.active");
    if (activeTab) {
      if (activeTab.dataset.page === "peserta") loadParticipants();
      if (activeTab.dataset.page === "rekap") loadAttendance();
    }
  } else {
    mainApp.hidden = true;
    authScreen.hidden = false;
  }
}

if (configError) {
  // config.js belum diisi / gagal dimuat: tampilkan pesan di layar login,
  // sembunyikan form supaya tidak mencoba login ke koneksi yang belum ada.
  authScreen.hidden = false;
  mainApp.hidden = true;
  loginForm.hidden = true;
  showAuthMsg(configError, "bad");
} else if (db) {
  db.auth.getSession().then(({ data }) => applyAuthUI(data.session));
  db.auth.onAuthStateChange((_event, session) => applyAuthUI(session));

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;
    authMsg.hidden = true;
    loginBtn.disabled = true;
    loginBtn.textContent = "Memproses...";
    try {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      authPasswordInput.value = "";
    } catch (err) {
      showAuthMsg("Gagal masuk: " + err.message, "bad");
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Masuk";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;
    try {
      await db.auth.signOut();
    } finally {
      logoutBtn.disabled = false;
    }
  });
}

let scanner = null;
let scanning = false;
let lastCode = "";
let lastScanAt = 0;

// ============ QR helper ============

function drawQr(container, text, size = 180) {
  container.innerHTML = "";
  if (typeof QRCode === "undefined") {
    throw new Error("Library QR gagal dimuat (cek koneksi internet).");
  }
  new QRCode(container, {
    text,
    width: size,
    height: size,
    // correctLevel H (bukan M) supaya QR tetap terbaca walau kartu dicetak
    // agak kecil atau ada sedikit noda/lipatan pada kartu fisik.
    correctLevel: QRCode.CorrectLevel.H
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
const defaultCardSettings = { judul: "KKG PJOK SD KEC.TANJUNG", subjudul: "KAB.BREBES", logo: DEFAULT_LOGO_DATA_URL };

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
  nipKetua: "199803242024211006",
  tandaTangan: ""
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
if (rekapSettings.tandaTangan) {
  $("tandaTanganPreview").src = rekapSettings.tandaTangan;
  $("tandaTanganPreviewRow").hidden = false;
}

$("tandaTanganFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const dataUrl = await compressImageFile(file, 500, 0.9);
    rekapSettings.tandaTangan = dataUrl;
    $("tandaTanganPreview").src = dataUrl;
    $("tandaTanganPreviewRow").hidden = false;
  } catch (err) {
    alert(err.message);
  }
});

$("tandaTanganClearBtn").addEventListener("click", () => {
  rekapSettings.tandaTangan = "";
  $("tandaTanganFile").value = "";
  $("tandaTanganPreviewRow").hidden = true;
});

$("rekapSettingsSave").addEventListener("click", () => {
  rekapSettings.judul = $("rekapJudul").value.trim() || defaultRekapSettings.judul;
  rekapSettings.kecamatan = $("rekapKecamatan").value.trim() || defaultRekapSettings.kecamatan;
  rekapSettings.tempat = $("rekapTempat").value.trim() || defaultRekapSettings.tempat;
  rekapSettings.namaKetua = $("rekapNamaKetua").value.trim();
  rekapSettings.nipKetua = $("rekapNipKetua").value.trim();
  // rekapSettings.tandaTangan sudah diperbarui langsung oleh listener upload/hapus di atas.
  saveRekapSettingsToStorage(rekapSettings);
  alert("Pengaturan rekap disimpan.");
});


// ============ FOTO PESERTA (dikompres jadi JPEG kecil, disimpan sebagai base64) ============

function compressImageFile(file, maxDim = 480, quality = 0.82, { preserveTransparency = false } = {}) {
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
        if (preserveTransparency) {
          // Foto peserta: biarkan transparan apa adanya (tanpa latar/pembungkus warna),
          // disimpan sebagai PNG supaya alpha channel-nya tetap ada di Kartu ID.
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png"));
        } else {
          // Isi latar putih dulu supaya PNG transparan (mis. hasil scan tanda tangan)
          // tidak berubah jadi hitam saat dikompres ke JPEG (JPEG tidak mendukung alpha).
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        }
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
    // maxDim dinaikkan (1400 -> 2000, resolusi paling tinggi) supaya foto
    // benar-benar tajam/HD, tidak blur, walau dicetak besar di Kartu ID.
    pendingFotoDataUrl = await compressImageFile(file, 2000, 0.95, { preserveTransparency: true });
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

// ============ RENDER KARTU ID (canvas, ukuran cetak CR80 8,56 x 5,398 cm @300dpi, portrait) ============

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

// ============ DEKORASI GELOMBANG SUDUT (gaya biru-kuning modern) ============
// Menggambar satu "gelombang" dekoratif di salah satu sudut kartu (navy +
// biru muda + garis aksen oranye). Dipanggil 4x (tiap sudut) dengan
// flip/translate berbeda supaya kodenya tidak diulang-ulang.
function drawCornerWave(ctx, W, H, flipX, flipY, big) {
  const NAVY = "#0f2f8c";
  const BLUE = "#2f7bd8";
  const ORANGE = "#f7a823";

  ctx.save();
  ctx.translate(flipX ? W : 0, flipY ? H : 0);
  ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

  // ah/aw big diperkecil dari versi sebelumnya (0.58/0.15) karena sekarang
  // dipakai simetris di KEDUA sisi kiri & kanan (dulu cuma satu sisi besar),
  // supaya tidak saling tumpang tindih berlebihan di tengah atas/bawah.
  const aw = big ? W * 0.44 : W * 0.28;
  const ah = big ? H * 0.15 : H * 0.065;

  // --- gumpalan navy (lapisan belakang) ---
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, ah * 1.4);
  ctx.bezierCurveTo(aw * 0.18, ah * 1.15, aw * 0.28, ah * 0.35, aw * 0.52, ah * 0.45);
  ctx.bezierCurveTo(aw * 0.74, ah * 0.55, aw * 0.86, ah * 0.05, aw, 0);
  ctx.closePath();
  ctx.fillStyle = NAVY;
  ctx.fill();

  // --- gumpalan biru muda (lapisan depan, lebih pendek) ---
  ctx.beginPath();
  ctx.moveTo(0, ah * 0.55);
  ctx.bezierCurveTo(aw * 0.12, ah * 0.45, aw * 0.20, ah * 0.05, aw * 0.38, ah * 0.12);
  ctx.bezierCurveTo(aw * 0.52, ah * 0.17, aw * 0.58, 0, aw * 0.74, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = BLUE;
  ctx.fill();

  // --- garis aksen oranye mengikuti tepi gelombang ---
  ctx.beginPath();
  ctx.moveTo(0, ah * 0.68);
  ctx.bezierCurveTo(aw * 0.14, ah * 0.55, aw * 0.24, ah * 0.14, aw * 0.44, ah * 0.20);
  ctx.bezierCurveTo(aw * 0.60, ah * 0.25, aw * 0.68, ah * 0.02, aw * 0.86, -ah * 0.02);
  ctx.lineWidth = Math.max(6, aw * 0.02);
  ctx.lineCap = "round";
  ctx.strokeStyle = ORANGE;
  ctx.stroke();

  ctx.restore();
}

function drawCardBackground(ctx, w, h) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Latar putih penuh + gelombang dekoratif SIMETRIS di 4 sudut (ukuran sama
  // kiri & kanan) supaya seimbang dengan konten yang sekarang semuanya
  // center di tengah kartu (sebelumnya besar-sebelah-kiri untuk layout
  // lama yang QR & fotonya berdampingan kiri-kanan).
  drawCornerWave(ctx, w, h, false, false, true);  // kiri atas (besar)
  drawCornerWave(ctx, w, h, true, false, true);   // kanan atas (besar, simetris)
  drawCornerWave(ctx, w, h, false, true, true);   // kiri bawah (besar)
  drawCornerWave(ctx, w, h, true, true, true);    // kanan bawah (besar, simetris)
}

async function renderIdCard(p, settings) {
  // Ukuran cetak 5 x 8,5 cm (ukuran ID card portrait pada umumnya), dirender
  // @900dpi (SCALE=3 dari basis 300dpi: 591x1004px) — resolusi paling tinggi
  // supaya foto & logo benar-benar tajam/HD, tidak blur, saat dicetak besar.
  const SCALE = 3;
  const W = 591 * SCALE, H = 1004 * SCALE;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // --- bingkai kartu membulat + latar, semuanya di-clip ke bentuk kartu
  // supaya tampak seperti kartu ID cetak profesional (bukan kotak lurus
  // biasa) ---
  const cardRadius = 22 * SCALE;
  ctx.save();
  roundRect(ctx, 0, 0, W, H, cardRadius);
  ctx.clip();

  drawCardBackground(ctx, W, H);

  // --- logo instansi: digambar LANGSUNG tanpa bingkai/pembungkus lingkaran,
  // proporsi asli logo dijaga (contain-fit) supaya tidak gepeng/pecah ---
  const logoMaxW = W * 0.44;
  const logoMaxH = 96 * SCALE;
  const logoTopY = 40 * SCALE;
  let cursorY = logoTopY + 30 * SCALE; // posisi default judul kalau logo kosong

  if (settings.logo) {
    try {
      const img = await loadImage(settings.logo);
      const ratio = Math.min(logoMaxW / img.width, logoMaxH / img.height);
      const iw = img.width * ratio, ih = img.height * ratio;
      const drawX = W / 2 - iw / 2;
      ctx.drawImage(img, drawX, logoTopY, iw, ih);
      cursorY = logoTopY + ih + 34 * SCALE;
    } catch (err) {
      console.error("Gagal memuat logo di kartu:", err);
    }
  }

  // --- SEMUA elemen di bawah ini (judul, sub-judul, foto, QR, nama, asal
  // sekolah) benar-benar DI-TENGAHKAN pada sumbu X = W/2, satu kolom
  // vertikal tunggal, supaya tidak ada lagi yang "kelihatan" tidak center
  // seperti saat foto & QR berdampingan sebelumnya. ---
  const centerX = W / 2;

  // --- judul ---
  ctx.textAlign = "center";
  ctx.fillStyle = "#123fa8";
  ctx.font = `bold ${30 * SCALE}px Arial, sans-serif`;
  const judulLines = wrapLines(ctx, settings.judul || "", W - 70 * SCALE);
  judulLines.forEach(line => {
    ctx.fillText(line, centerX, cursorY);
    cursorY += 35 * SCALE;
  });

  // --- sub-judul (hitam tebal, senada dengan versi cetak KKG) ---
  cursorY += 6 * SCALE;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${18 * SCALE}px Arial, sans-serif`;
  const subLines = wrapLines(ctx, settings.subjudul || "", W - 70 * SCALE);
  subLines.forEach(line => {
    ctx.fillText(line, centerX, cursorY);
    cursorY += 23 * SCALE;
  });

  cursorY += 18 * SCALE;

  // --- foto peserta: kotak membulat DI TENGAH kartu (bukan lagi mepet ke
  // tepi kanan), mode "cover" supaya kotak selalu terisi penuh & rapi
  // seperti foto formal pada umumnya ---
  const fotoBoxW = W * 0.56;
  const fotoBoxH = fotoBoxW * 1.18;
  const fotoBoxX = centerX - fotoBoxW / 2;
  const fotoBoxY = cursorY;
  ctx.fillStyle = "#eef1f7";
  roundRect(ctx, fotoBoxX, fotoBoxY, fotoBoxW, fotoBoxH, 14 * SCALE);
  ctx.fill();

  if (p.foto) {
    try {
      const img = await loadImage(p.foto);
      ctx.save();
      roundRect(ctx, fotoBoxX, fotoBoxY, fotoBoxW, fotoBoxH, 14 * SCALE);
      ctx.clip();
      // Mode "cover": foto mengisi penuh kotak (dipotong secukupnya kalau
      // rasionya beda), supaya hasil selalu rapi & tajam, tidak ada spasi
      // kosong seperti mode "contain".
      const ratio = Math.max(fotoBoxW / img.width, fotoBoxH / img.height);
      const iw = img.width * ratio, ih = img.height * ratio;
      // Horizontal tetap di-tengah (aman, jarang motong bagian penting).
      // Vertikal DIPATOK PERMANEN KE ATAS (bukan di-tengah lagi) — jadi
      // kalau ada bagian yang perlu dipotong karena rasio beda, yang
      // dipotong SELALU bagian bawah saja, kepala/rambut di atas tidak
      // pernah terpotong.
      const drawX = fotoBoxX + (fotoBoxW - iw) / 2;
      const drawY = fotoBoxY;
      ctx.drawImage(img, drawX, drawY, iw, ih);
      ctx.restore();
    } catch (err) {
      console.error("Gagal memuat foto peserta di kartu:", err);
    }
  }
  ctx.lineWidth = 2 * SCALE;
  ctx.strokeStyle = "#d8dce8";
  roundRect(ctx, fotoBoxX, fotoBoxY, fotoBoxW, fotoBoxH, 14 * SCALE);
  ctx.stroke();

  cursorY = fotoBoxY + fotoBoxH + 22 * SCALE;

  // --- QR code, DI TENGAH kartu (centerX yang sama persis dengan judul,
  // foto, nama, & asal sekolah) ---
  const qrSize = 130 * SCALE;
  const qrBoxPad = 10 * SCALE;
  const qrBoxSize = qrSize + qrBoxPad * 2;
  const qrBoxX = centerX - qrBoxSize / 2;
  const qrBoxY = cursorY;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14 * SCALE);
  ctx.fill();
  ctx.lineWidth = 2 * SCALE;
  ctx.strokeStyle = "#d8dce8";
  roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 14 * SCALE);
  ctx.stroke();

  const tmp = document.createElement("div");
  tmp.style.position = "fixed";
  tmp.style.left = "-9999px";
  document.body.appendChild(tmp);
  try {
    const qrCanvas = drawQr(tmp, p.kode_qr, qrSize);
    ctx.drawImage(qrCanvas, qrBoxX + qrBoxPad, qrBoxY + qrBoxPad, qrSize, qrSize);
  } finally {
    document.body.removeChild(tmp);
  }

  cursorY = qrBoxY + qrBoxSize + 26 * SCALE;

  // --- nama & asal sekolah, DI TENGAH (centerX yang sama) ---
  const textMaxWidth = W - 64 * SCALE;

  ctx.textAlign = "center";
  ctx.fillStyle = "#123fa8";
  ctx.font = `bold ${19 * SCALE}px Arial, sans-serif`;
  const namaLines = wrapLines(ctx, p.nama.toUpperCase(), textMaxWidth);
  namaLines.forEach(line => {
    ctx.fillText(line, centerX, cursorY);
    cursorY += 24 * SCALE;
  });

  cursorY += 5 * SCALE;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${14 * SCALE}px Arial, sans-serif`;
  const sekolahLines = wrapLines(ctx, (p.asal_sekolah || "-").toUpperCase(), textMaxWidth);
  sekolahLines.forEach(line => {
    ctx.fillText(line, centerX, cursorY);
    cursorY += 18 * SCALE;
  });

  ctx.restore(); // lepas clip bentuk kartu

  // --- garis tepi tipis di sekeliling kartu supaya terlihat rapi & selesai
  // (finishing) seperti kartu ID cetak profesional ---
  ctx.lineWidth = 2 * SCALE;
  ctx.strokeStyle = "#d8dce8";
  roundRect(ctx, 1 * SCALE, 1 * SCALE, W - 2 * SCALE, H - 2 * SCALE, cardRadius - 1 * SCALE);
  ctx.stroke();

  return canvas;
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
          // maxDim dinaikkan (1400 -> 2000, resolusi paling tinggi) supaya
          // foto benar-benar tajam/HD, tidak blur.
          payload.foto = await compressImageFile(fotoFile, 2000, 0.95, { preserveTransparency: true });
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

// ============ OVERLAY CEKLIS DI TENGAH AREA SCAN ============
// Muncul sesaat menimpa tampilan kamera supaya petugas langsung tahu
// hasil scan tanpa harus melirik ke bawah, lalu hilang otomatis.
let scanOverlayTimer = null;

const SCAN_ICONS = {
  ok: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 17h.01" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.6 3.9 2.4 18a1.6 1.6 0 0 0 1.4 2.4h16.4a1.6 1.6 0 0 0 1.4-2.4L13.4 3.9a1.6 1.6 0 0 0-2.8 0Z" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></svg>',
  bad: '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'
};

function showScanOverlay(type, title, sub = "") {
  const el = $("scanOverlay");
  if (!el) return;
  clearTimeout(scanOverlayTimer);
  el.querySelector(".scan-overlay-icon").innerHTML = SCAN_ICONS[type] || SCAN_ICONS.bad;
  el.querySelector(".scan-overlay-title").textContent = title;
  el.querySelector(".scan-overlay-sub").textContent = sub;
  el.className = "scan-overlay show " + type;
  scanOverlayTimer = setTimeout(() => hideScanOverlay(), 2200);
}

function hideScanOverlay() {
  const el = $("scanOverlay");
  if (!el) return;
  el.className = "scan-overlay";
}

async function startScanner() {
  if (scanning) return;
  hideScanOverlay();
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
  hideScanOverlay();
  $("result").textContent = "Kamera dimatikan.";
}

// Ambil hanya jam:menit dari nilai jam (buang detik kalau ada), mis. "10:06:23" -> "10:06".
function jamPendek(v) {
  if (!v) return "-";
  return String(v).slice(0, 5);
}

async function handleScan(code) {
  if (!requireDb()) return showResult(configError, "bad");
  const now = Date.now();
  if (code === lastCode && now - lastScanAt < 3000) return;
  lastCode = code; lastScanAt = now;

  const { data: peserta, error } = await db
    .from("peserta").select("*").eq("kode_qr", code).maybeSingle();

  if (error) {
    showScanOverlay("bad", "GAGAL", "Gagal membaca data peserta.");
    return showResult("Gagal membaca data peserta: " + error.message, "bad");
  }
  if (!peserta) {
    showScanOverlay("bad", "TIDAK TERDAFTAR", "QR tidak dikenali.");
    return showResult("QR tidak terdaftar.", "bad");
  }

  const today = new Date().toISOString().slice(0,10);
  const { data: existing } = await db
    .from("kehadiran").select("*")
    .eq("peserta_id", peserta.id).eq("tanggal", today).maybeSingle();

  if (existing) {
    showScanOverlay("warn", "SUDAH ABSEN", `${peserta.nama} — ${jamPendek(existing.jam)}`);
    return showResult(`⚠️ SUDAH ABSEN<br><b>${esc(peserta.nama)}</b><br>${jamPendek(existing.jam)}`, "warn");
  }

  const jamSekarang = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const { error: insertError } = await db.from("kehadiran").insert({
    peserta_id: peserta.id,
    tanggal: today,
    jam: jamSekarang
  });

  if (insertError) {
    showScanOverlay("bad", "GAGAL", "Gagal menyimpan kehadiran.");
    return showResult("Gagal menyimpan: " + insertError.message, "bad");
  }
  showScanOverlay("ok", "ABSENSI BERHASIL", `${peserta.nama}${peserta.asal_sekolah ? " — " + peserta.asal_sekolah : ""}`);
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
      <td>${esc(formatTanggalPendek(x.tanggal))}</td><td>${jamPendek(x.jam)}</td></tr>`).join("");
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

// ============ HAPUS DATA KEHADIRAN (untuk menghemat penyimpanan) ============
// Menghapus baris di tabel "kehadiran" saja — data peserta (tabel "peserta")
// tidak pernah ikut terhapus, jadi QR code peserta tetap bisa dipakai lagi nanti.
async function deleteAttendanceRows(ids, { silent = false } = {}) {
  if (!ids || !ids.length) return;
  if (!requireDb()) return alert(configError);
  const btn = $("deleteRekapBtn");
  const originalLabel = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Menghapus..."; }
  try {
    const { error } = await db.from("kehadiran").delete().in("id", ids);
    if (error) throw error;
    if (!silent) alert(`Berhasil menghapus ${ids.length} data kehadiran.`);
    await loadAttendance();
  } catch (err) {
    alert("Gagal menghapus data kehadiran: " + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
  }
}

$("deleteRekapBtn").addEventListener("click", async () => {
  const rows = attendanceFiltered.length ? attendanceFiltered : attendanceData;
  if (!rows.length) return alert("Tidak ada data kehadiran untuk dihapus.");
  const selected = $("rekapDateFilter").value || "semua";
  const label = selected === "semua" ? "SEMUA tanggal" : formatTanggalPendek(selected);
  const ok = confirm(
    `Hapus ${rows.length} data kehadiran untuk ${label}?\n\n` +
    `Data peserta TIDAK ikut terhapus (hanya riwayat scan/absennya). ` +
    `Tindakan ini tidak bisa dibatalkan — pastikan sudah unduh PDF-nya dulu kalau perlu arsipnya.`
  );
  if (!ok) return;
  await deleteAttendanceRows(rows.map(r => r.id));
});

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
  if (typeof window.jspdf === "undefined" || typeof window.jspdf.jsPDF !== "function") {
    return alert("Library PDF (jsPDF) gagal dimuat. Pastikan HP/komputer ini terhubung ke internet lalu muat ulang halaman.");
  }
  const __testDoc = new window.jspdf.jsPDF();
  if (typeof __testDoc.autoTable !== "function") {
    return alert("Library tabel PDF (jsPDF-AutoTable) gagal dimuat sepenuhnya. Coba muat ulang halaman (tarik ke bawah untuk refresh), atau ganti jaringan internet lalu coba lagi.");
  }

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Menyiapkan PDF...";

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();

    // Judul rekap HANYA menampilkan "TAHUN xxxx" — angka tahun otomatis mengikuti
    // tahun data yang dipilih (bukan tanggal lengkap seperti "28 Agustus 2026"),
    // supaya tahun berikutnya cukup ganti sendiri tanpa perlu diedit manual.
    let agendaLabel;
    let fileTag;
    if (selectedTanggal === "semua") {
      const years = [...new Set(rows.map(x => (x.tanggal || "").slice(0, 4)).filter(Boolean))].sort();
      agendaLabel = years.length === 1 ? `TAHUN ${years[0]}`
        : years.length > 1 ? `TAHUN ${years[0]} - ${years[years.length - 1]}`
        : `TAHUN ${new Date().getFullYear()}`;
      fileTag = "SemuaTanggal";
    } else {
      const tahunTerpilih = selectedTanggal.slice(0, 4) || String(new Date().getFullYear());
      agendaLabel = `TAHUN ${tahunTerpilih}`;
      fileTag = selectedTanggal;
    }

    let y = 12;

    if (cardSettings.logo) {
      try {
        const props = doc.getImageProperties(cardSettings.logo);
        const logoW = 18;
        const logoH = (props.height / props.width) * logoW;
        doc.addImage(cardSettings.logo, imageFormatFromDataUrl(cardSettings.logo), pageW / 2 - logoW / 2, y, logoW, logoH);
        y += logoH + 5;
      } catch (err) {
        console.error("Gagal menambahkan logo ke PDF:", err);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text((rekapSettings.judul || defaultRekapSettings.judul).toUpperCase(), pageW / 2, y, { align: "center" });
    y += 5.5;
    doc.setFontSize(11);
    doc.text(`KECAMATAN ${(rekapSettings.kecamatan || "-").toUpperCase()} ${agendaLabel}`, pageW / 2, y, { align: "center" });
    y += 8;

    doc.autoTable({
      startY: y,
      head: [["No", "Nama", "Asal Sekolah", "Tanggal", "Jam"]],
      body: rows.map((x, i) => [
        i + 1,
        x.peserta?.nama || "-",
        x.peserta?.asal_sekolah || "-",
        formatTanggalPendek(x.tanggal) || "-",
        jamPendek(x.jam)
      ]),
      styles: { font: "helvetica", fontSize: 10, cellPadding: 2.2 },
      headStyles: { fillColor: [18, 63, 168], textColor: 255, fontStyle: "bold" },
      margin: { left: 15, right: 15 }
    });

    let finalY = doc.lastAutoTable.finalY + 12;
    if (finalY > 260) { doc.addPage(); finalY = 20; }

    const signX = pageW - 70;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${rekapSettings.tempat || "-"}, ${formatTanggalIndonesia(new Date())}`, signX, finalY);
    doc.text("Ketua KKG PJOK", signX, finalY + 6);

    // Tanda tangan (gambar hasil upload) ditempel di antara "Ketua KKG PJOK"
    // dan nama. Jarak ke nama menyesuaikan tinggi gambar tanda tangan supaya
    // tidak ada ruang kosong berlebih (tetap rapat & rapi kalau tidak ada tanda tangan).
    let namaY = finalY + 20;
    if (rekapSettings.tandaTangan) {
      try {
        const props = doc.getImageProperties(rekapSettings.tandaTangan);
        const ttdW = 28;
        const ttdH = (props.height / props.width) * ttdW;
        const ttdY = finalY + 7;
        doc.addImage(rekapSettings.tandaTangan, imageFormatFromDataUrl(rekapSettings.tandaTangan), signX, ttdY, ttdW, ttdH);
        namaY = ttdY + ttdH + 5;
      } catch (err) {
        console.error("Gagal menambahkan tanda tangan ke PDF:", err);
      }
    }

    doc.setFont("helvetica", "bold");
    doc.text(rekapSettings.namaKetua || "-", signX, namaY);
    if (rekapSettings.nipKetua) {
      doc.setFont("helvetica", "normal");
      doc.text(`NIP.${rekapSettings.nipKetua}`, signX, namaY + 6);
    }

    doc.save(`Rekap_Kehadiran_${fileTag}.pdf`);

    // Setelah PDF berhasil diunduh, tawarkan untuk mengosongkan data kehadiran
    // yang baru saja diekspor supaya penyimpanan di Supabase tidak terus menumpuk.
    // Kalau dipilih "Batal", data dibiarkan tetap ada seperti biasa.
    const label = selectedTanggal === "semua" ? "SEMUA tanggal" : formatTanggalPendek(selectedTanggal);
    const hapusIds = rows.map(r => r.id);
    setTimeout(() => {
      const hapus = confirm(
        `PDF berhasil diunduh.\n\n` +
        `Hapus ${hapusIds.length} data kehadiran untuk ${label} dari database sekarang, ` +
        `agar hemat penyimpanan? Data peserta tidak akan terpengaruh.\n\n` +
        `(Pilih Batal kalau ingin datanya tetap disimpan.)`
      );
      if (hapus) deleteAttendanceRows(hapusIds, { silent: true });
    }, 300);
  } catch (err) {
    console.error("Gagal membuat PDF:", err);
    alert("Gagal membuat PDF: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
});

// Deteksi format gambar (PNG/JPEG) dari data URL, supaya addImage() jsPDF
// tidak salah asumsi format walau sumbernya campuran (upload PNG atau JPEG hasil kompresi foto).
function imageFormatFromDataUrl(dataUrl) {
  if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/png")) return "PNG";
  return "JPEG";
}

function esc(v="") {
  return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function escAttr(v="") { return esc(v); }

// Kalau config.js belum diisi, tampilkan pesan begitu halaman dibuka.
if (configError) {
  $("result").textContent = configError;
  $("result").className = "result warn";
}
