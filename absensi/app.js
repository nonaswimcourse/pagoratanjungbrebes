import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let scanner = null;
let scanning = false;
let lastCode = "";
let lastScanAt = 0;

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

async function loadParticipants() {
  const box = $("participantList");
  const { data, error } = await db.from("peserta").select("*").order("nomor");
  if (error) return box.innerHTML = `<p class="error">${error.message}</p>`;
  if (!data.length) return box.innerHTML = "<p>Belum ada peserta.</p>";
  box.innerHTML = data.map(p => `
    <div class="participant">
      <div><b>${esc(p.nama)}</b><small>${esc(p.nomor)} · ${esc(p.kelas || "-")}</small></div>
      <div id="qr-${p.id}" class="qr"></div>
    </div>`).join("");
  data.forEach(p => {
    new QRCode(document.getElementById(`qr-${p.id}`), {
      text: p.kode_qr, width: 90, height: 90
    });
  });
}

$("participantForm").addEventListener("submit", async (e) => {
  e.preventDefault();
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

async function loadAttendance() {
  const { data, error } = await db.from("kehadiran")
    .select("id,tanggal,jam,peserta(nomor,nama,kelas)")
    .order("tanggal", { ascending:false }).order("jam", { ascending:false });
  if (error) {
    $("attendanceList").innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    return;
  }
  $("attendanceList").innerHTML = data.map((x,i) => `
    <tr><td>${i+1}</td><td>${esc(x.peserta?.nama)}</td><td>${esc(x.peserta?.kelas || "-")}</td>
    <td>${x.tanggal}</td><td>${x.jam}</td></tr>`).join("");
  $("stats").innerHTML = `<div><b>${data.length}</b><span>Total scan</span></div>`;
}

function esc(v="") {
  return String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
