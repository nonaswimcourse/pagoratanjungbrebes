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

function drawQr(canvas, text) {
  return new Promise((resolve, reject) => {
    if (typeof QRCode === "undefined") {
      return reject(new Error("Library QR gagal dimuat (cek koneksi internet)."));
    }
    QRCode.toCanvas(canvas, text, { width: 128, margin: 1 }, (err) => {
      if (err) reject(err); else resolve();
    });
  });
}

function newKodeQr() {
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
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
      <canvas class="qr-thumb" id="qr-${p.id}"></canvas>
      <div class="info">
        <div class="view-mode">
          <b>${esc(p.nama)}</b>
          <small>${esc(p.asal_sekolah || "-")}</small>
        </div>
        <div class="edit-mode" hidden>
          <input class="edit-nama" value="${escAttr(p.nama)}" placeholder="Nama peserta">
          <input class="edit-sekolah" value="${escAttr(p.asal_sekolah || "")}" placeholder="Asal sekolah">
        </div>
      </div>
      <div class="actions">
        <button type="button" class="secondary btn-download">⬇ QR</button>
        <button type="button" class="secondary btn-edit">✎ Edit</button>
        <button type="button" class="danger btn-delete">🗑 Hapus</button>
        <button type="button" class="primary btn-save" hidden>💾 Simpan</button>
        <button type="button" class="secondary btn-cancel" hidden>✕ Batal</button>
      </div>
    </div>`).join("");

  // Gambar QR untuk tiap peserta
  data.forEach(p => {
    const canvas = document.getElementById(`qr-${p.id}`);
    drawQr(canvas, p.kode_qr).catch(err => {
      const card = canvas.closest(".participant");
      const info = card.querySelector(".info");
      info.insertAdjacentHTML("beforeend", `<div class="qr-error">QR gagal dibuat: ${esc(err.message)}</div>`);
      card.querySelector(".btn-download").disabled = true;
    });
  });

  // ==== Aksi per kartu (unduh / edit / simpan / batal / hapus) ====
  box.querySelectorAll(".participant").forEach(card => {
    const id = card.dataset.id;
    const viewMode = card.querySelector(".view-mode");
    const editMode = card.querySelector(".edit-mode");
    const btnDownload = card.querySelector(".btn-download");
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
      const { error } = await db.from("peserta").update({ nama, asal_sekolah }).eq("id", id);
      if (error) return alert("Gagal menyimpan: " + error.message);
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

$("participantForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireDb()) return alert(configError);
  const nama = $("nama").value.trim();
  const asal_sekolah = $("sekolah").value.trim();
  if (!nama || !asal_sekolah) return alert("Nama dan asal sekolah wajib diisi.");
  const { error } = await db.from("peserta").insert({ nama, asal_sekolah, kode_qr: newKodeQr() });
  if (error) return alert(error.message);
  e.target.reset();
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

async function loadAttendance() {
  const box = $("attendanceList");
  if (!requireDb()) {
    box.innerHTML = `<tr><td colspan="5">${esc(configError)}</td></tr>`;
    return;
  }
  const { data, error } = await db.from("kehadiran")
    .select("id,tanggal,jam,peserta(nama,asal_sekolah)")
    .order("tanggal", { ascending:false }).order("jam", { ascending:false });
  if (error) {
    box.innerHTML = `<tr><td colspan="5">${esc(error.message)}</td></tr>`;
    return;
  }
  box.innerHTML = data.map((x,i) => `
    <tr><td>${i+1}</td><td>${esc(x.peserta?.nama)}</td><td>${esc(x.peserta?.asal_sekolah || "-")}</td>
    <td>${x.tanggal}</td><td>${x.jam}</td></tr>`).join("");
  $("stats").innerHTML = `<div><b>${data.length}</b><span>Total scan</span></div>`;
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
