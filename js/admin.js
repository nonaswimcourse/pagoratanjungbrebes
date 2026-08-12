const TAG_TO_CAT = { Pelatihan: 'pelatihan', Lomba: 'lomba', Acara: 'acara' };
const CAT_TO_TAG = { pelatihan: 'Pelatihan', lomba: 'Lomba', acara: 'Acara' };
const BUCKET = 'kegiatan-images';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const loginBox = document.getElementById('loginBox');
const dashboard = document.getElementById('dashboard');
const configWarning = document.getElementById('configWarning');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

const kegiatanForm = document.getElementById('kegiatanForm');
const formError = document.getElementById('formError');
const editingIdInput = document.getElementById('editingId');
const formMode = document.getElementById('formMode');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const kegiatanList = document.getElementById('kegiatanList');

let client = null;

function formatTanggalIndonesia(v){
 const d=new Date(v);
 const hari=["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
 const bulan=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
 return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}
function waktuUpload(){
 const n=new Date();
 return n.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+' WIB';
}


function showError(el, message) {
  el.textContent = message;
  el.style.display = 'block';
}
function hideError(el) {
  el.style.display = 'none';
}

async function init() {
  client = (typeof getSupabaseClient === 'function') ? getSupabaseClient() : null;
  if (!client) {
    configWarning.style.display = 'block';
    loginForm.querySelector('button').disabled = true;
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (session) {
    showDashboard();
  } else {
    showLogin();
  }

  client.auth.onAuthStateChange((_event, session) => {
    if (session) showDashboard(); else showLogin();
  });
}

function showLogin() {
  loginBox.style.display = 'block';
  dashboard.style.display = 'none';
  logoutBtn.style.display = 'none';
}

function showDashboard() {
  loginBox.style.display = 'none';
  dashboard.style.display = 'block';
  logoutBtn.style.display = 'inline-flex';
  loadList();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(loginError);
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    showError(loginError, 'Gagal masuk: email atau password salah.');
  }
});

logoutBtn.addEventListener('click', async () => {
  await client.auth.signOut();
});

function resetForm() {
  kegiatanForm.reset();
  editingIdInput.value = '';
  formMode.textContent = 'Tambah Kegiatan';
  submitBtn.textContent = 'Simpan Kegiatan';
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', resetForm);

async function loadList() {
  kegiatanList.innerHTML = '<p class="muted">Memuat data…</p>';
  const { data, error } = await client.from('kegiatan').select('*').order('created_at', { ascending: false });
  if (error) {
    kegiatanList.innerHTML = `<p class="error-text">Gagal memuat data: ${error.message}</p>`;
    return;
  }
  if (!data || data.length === 0) {
    kegiatanList.innerHTML = '<p class="muted">Belum ada kegiatan. Tambahkan lewat form di atas.</p>';
    return;
  }
  kegiatanList.innerHTML = data.map(row => `
    <div class="admin-list-item">
      <div class="admin-list-thumb" style="background-image:url('${row.gambar || ''}')"></div>
      <div class="admin-list-info">
        <span class="tag">${CAT_TO_TAG[row.kategori] || row.kategori} · ${row.tanggal ? formatTanggalIndonesia(row.tanggal) : ''}</span>
        <span class="title">${row.judul}</span>
      </div>
      <div class="admin-list-actions">
        <button class="btn btn-solide" data-edit="${row.id}" style="padding:8px 16px;font-size:12px;">Edit</button>
        <button class="btn btn-solide" data-delete="${row.id}" style="padding:8px 16px;font-size:12px;border-color:#ff5c5c;color:#ff8080;">Hapus</button>
      </div>
    </div>
  `).join('');

  kegiatanList.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => startEdit(btn.dataset.edit, data));
  });
  kegiatanList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => deleteItem(btn.dataset.delete));
  });
}

function startEdit(id, data) {
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  editingIdInput.value = row.id;
  document.getElementById('fTitle').value = row.judul;
  document.getElementById('fTag').value = CAT_TO_TAG[row.kategori] || '';
  document.getElementById('fDate').value = row.tanggal || '';
  document.getElementById('fExcerpt').value = row.ringkasan || '';
  document.getElementById('fBody').value = row.isi || '';
  document.getElementById('fCaption2').value = row.keterangan_isi || '';
  formMode.textContent = 'Edit Kegiatan';
  submitBtn.textContent = 'Simpan Perubahan';
  cancelEditBtn.style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteItem(id) {
  const ok = await appConfirm('Hapus kegiatan ini dari galeri? Tindakan ini tidak dapat dibatalkan.', { danger: true, confirmText: 'Ya, hapus' });
  if (!ok) return;
  const { error } = await client.from('kegiatan').delete().eq('id', id);
  if (error) {
    appToast('Gagal menghapus: ' + error.message, 'error');
    return;
  }
  appToast('Kegiatan berhasil dihapus.');
  loadList();
}

async function uploadImageIfAny(inputId) {
  const fileInput = document.getElementById(inputId);
  const file = fileInput.files[0];
  if (!file) return null;
  const path = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  const { error } = await client.storage.from(BUCKET).upload(path, file);
  if (error) throw new Error('Upload foto gagal: ' + error.message);
  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

kegiatanForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(formError);
  submitBtn.disabled = true;

  try {
    const editingId = editingIdInput.value;
    const tag = document.getElementById('fTag').value;
    const title = document.getElementById('fTitle').value.trim();
    const payload = {
      judul: title,
      kategori: TAG_TO_CAT[tag],
      slug: `${slugify(title)}-${Date.now()}`,
      tanggal: document.getElementById('fDate').value,
      upload_time: waktuUpload(),
      ringkasan: document.getElementById('fExcerpt').value.trim(),
      isi: document.getElementById('fBody').value.trim(),
      keterangan_isi: document.getElementById('fCaption2').value.trim()
    };

    const imageUrl = await uploadImageIfAny('fImageFile');
    if (imageUrl) payload.gambar = imageUrl;

    const imageUrl2 = await uploadImageIfAny('fImageFile2');
    if (imageUrl2) payload.gambar_isi = imageUrl2;

    if (!editingId && !imageUrl) {
      throw new Error('Pilih foto judul kegiatan terlebih dahulu.');
    }

    let error;
    if (editingId) {
      ({ error } = await client.from('kegiatan').update(payload).eq('id', editingId));
    } else {
      ({ error } = await client.from('kegiatan').insert(payload));
    }
    if (error) throw new Error(error.message);

    appToast(editingId ? 'Perubahan berhasil disimpan.' : 'Kegiatan baru berhasil dipublikasikan.');
    resetForm();
    loadList();
  } catch (err) {
    showError(formError, err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

init();
