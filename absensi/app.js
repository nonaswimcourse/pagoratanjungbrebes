// --- Pasang tab menu duluan, SEBELUM apa pun yang berhubungan dengan Supabase.
// Ini penting: kalau config.js salah isi / koneksi Supabase gagal, menu tetap
// bisa diklik dan halaman tetap bisa dibuka.
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

// --- Inisialisasi Supabase dibungkus try/catch supaya kalau config.js belum
// diisi / salah format, error-nya tidak mematikan seluruh aplikasi (menu tetap jalan).
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

// ============ PESERTA + QR ============

async function loadParticipants() {
  const box = $("participantList");
  if (!requireDb(box)) return;

  box.innerHTML = "Memuat...";
  const { data, error } = await db.from("peserta").select("*").order("nomor");
  if (error) return box.innerHTML = `<p class="error">${esc(error.message)}</p>`;
  if (!data.length) return box.innerHTML = "<p>Belum ada peserta.</p>";

  box.innerHTML = data.map(p => `
    <div class="participant">
      <div><b>${esc(p.nama)}</b><small>${esc(p.nomor)} · ${esc(p.kelas || "-")}</small></div>
      <div class="qr-wrap">
        <canvas id="qr-${p.id}" class="qr"></canvas>
        <button type="button" class="download-qr" data-id="${p.id}" data-nama="${esc(p.nama)}" data-nomor="${esc(p.nomor)}">⬇ Unduh QR</button>
      </div>
    </div>`).join("");

  data.forEach(p => {
    const canvas = document.getElementById(`qr-${p.id}`);
    QRCode.toCanvas(canvas, p.kode_qr, { width: 120, margin: 1 }, (err) => {
      if (err) console.error(err);
    });
  });

  box.querySelectorAll(".download-qr").forEach(btn => {
    btn.addEventListener("click", () => {
      const canvas = $(`qr-${btn.dataset.id}`);
      const link = document.createElement("a");
      const namaFile = (btn.dataset.nomor + "_" + btn.dataset.nama)
        .replace(/[^a-z0-9_-]+/gi, "_");
      link.download = `QR_${namaFile}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
}

$("participantForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!requireDb()) return alert(configError);
  const nomor = $("nomor").value.trim();
  const nama = $("nama").value.trim();
  const kelas = $("kelas").value.trim();
  const kode_qr = nomor; // QR berisi kode unik peserta.
  const { error } = await db.from("peserta").insert({ nomor, nama, kelas, kode_qr });
  if (error) return alert(error.message);
  e.target.reset();
  loadParticipants();
  alert("Peserta berhasil disimpan.");
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
  showResult(`✅ ABSEN BERHASIL<br><b>${esc(peserta.nama)}</b><br>${peserta.nomor} · ${esc(peserta.kelas || "-")}`, "ok");
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
    .select("id,tanggal,jam,peserta(nomor,nama,kelas)")
    .order("tanggal", { ascending:false }).order("jam", { ascending:false });
  if (error) {
    box.innerHTML = `<tr><td colspan="5">${esc(error.message)}</td></tr>`;
    return;
  }
  box.innerHTML = data.map((x,i) => `
    <tr><td>${i+1}</td><td>${esc(x.peserta?.nama)}</td><td>${esc(x.peserta?.kelas || "-")}</td>
    <td>${x.tanggal}</td><td>${x.jam}</td></tr>`).join("");
  $("stats").innerHTML = `<div><b>${data.length}</b><span>Total scan</span></div>`;
}

function esc(v="") {
  return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

// Kalau config.js belum diisi, tampilkan pesan begitu halaman dibuka.
if (configError) {
  $("result").textContent = configError;
  $("result").className = "result warn";
}
