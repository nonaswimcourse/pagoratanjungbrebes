// ===================== PAGE LOADER (logo Pagora) =====================
// Loader tampil saat halaman pertama kali dibuka/di-refresh, DAN saat
// mengklik menu apa pun (termasuk menu yang cuma scroll ke section, seperti
// Profil / Ruang Guru di halaman yang sama).
(function () {
  var loader = document.getElementById('pageLoader');
  if (!loader) return;

  var NAV_DELAY = 380;      // ms, jeda sebelum benar-benar pindah ke halaman lain
  var ANCHOR_DELAY = 700;   // ms, durasi loader saat cuma scroll ke section di halaman yang sama

  function hideLoader() {
    loader.classList.add('pl-hide');
  }
  function showLoader() {
    loader.classList.remove('pl-hide');
  }

  // Loader selalu tampil pas 2 detik di awal, lalu hilang otomatis.
  setTimeout(hideLoader, 2000);

  // Saat halaman dipulihkan dari bfcache (klik tombol back/forward browser).
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) hideLoader();
  });

  // Tampilkan loader lagi setiap kali mengklik link menu.
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href) return;

    if (link.target && link.target !== '_self') return;
    if (link.hasAttribute('download')) return;
    if (link.dataset.noLoader !== undefined) return;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    // Hanya cegat navigasi ke halaman lain dalam situs ini.
    if (url.origin !== window.location.origin) return;

    var samePageSameDoc = url.href.split('#')[0] === window.location.href.split('#')[0];

    showLoader();

    if (samePageSameDoc) {
      // Cuma scroll ke section (mis. #profil, #ruang-guru): biarkan browser scroll
      // seperti biasa, loader tampil sebentar lalu hilang sendiri.
      setTimeout(hideLoader, ANCHOR_DELAY);
    } else {
      // Pindah ke halaman/dokumen lain: tunggu animasi loader, baru benar-benar pindah.
      e.preventDefault();
      setTimeout(function () {
        window.location.href = url.href;
      }, NAV_DELAY);
    }
  });
})();
