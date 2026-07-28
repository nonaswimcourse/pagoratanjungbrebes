// ===================== UI FEEDBACK (Toast & Confirm Modal) =====================
// Menyediakan appToast() dan appConfirm() yang dipakai oleh admin.js.
// Dibuat mandiri (tanpa dependensi CSS eksternal) agar tampil konsisten
// walau file css/style.css berubah.

(function () {
  const COLORS = {
    bg: '#1c2124',
    line: 'rgba(244,246,240,0.10)',
    lime: '#b7ff3b',
    danger: '#ff5c5c',
    text: '#f4f6f0',
    muted: '#98a196'
  };

  function ensureContainer() {
    let container = document.getElementById('appToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'appToastContainer';
      container.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        display:flex;flex-direction:column;gap:10px;z-index:99999;
        align-items:center;pointer-events:none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  window.appToast = function (message, type = 'success') {
    const container = ensureContainer();
    const toast = document.createElement('div');
    const isError = type === 'error';
    toast.textContent = message;
    toast.style.cssText = `
      font-family:'Plus Jakarta Sans',sans-serif;
      background:${COLORS.bg};
      color:${isError ? COLORS.danger : COLORS.text};
      border:1px solid ${isError ? COLORS.danger : COLORS.line};
      padding:14px 22px;border-radius:14px;font-size:14px;font-weight:600;
      box-shadow:0 10px 30px rgba(0,0,0,0.4);
      opacity:0;transform:translateY(12px);
      transition:opacity .25s ease, transform .25s ease;
      pointer-events:auto;max-width:90vw;text-align:center;
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  };

  window.appConfirm = function (message, opts = {}) {
    const { danger = false, confirmText = 'Ya', cancelText = 'Batal' } = opts;
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;background:rgba(10,12,10,0.65);
        display:flex;align-items:center;justify-content:center;
        z-index:100000;padding:20px;
      `;

      const box = document.createElement('div');
      box.style.cssText = `
        font-family:'Plus Jakarta Sans',sans-serif;
        background:${COLORS.bg};border:1px solid ${COLORS.line};
        border-radius:22px;padding:28px;max-width:420px;width:100%;
        box-shadow:0 20px 60px rgba(0,0,0,0.5);
      `;

      box.innerHTML = `
        <p style="color:${COLORS.text};font-size:16px;line-height:1.5;margin:0 0 22px;">${message}</p>
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button data-role="cancel" style="
            padding:10px 20px;border-radius:100px;border:1px solid ${COLORS.line};
            background:transparent;color:${COLORS.muted};font-weight:600;cursor:pointer;
            font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;
          ">${cancelText}</button>
          <button data-role="confirm" style="
            padding:10px 20px;border-radius:100px;border:none;
            background:${danger ? COLORS.danger : COLORS.lime};
            color:${danger ? '#2a0000' : '#12160f'};font-weight:700;cursor:pointer;
            font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;
          ">${confirmText}</button>
        </div>
      `;

      overlay.appendChild(box);
      document.body.appendChild(overlay);

      function close(result) {
        overlay.remove();
        resolve(result);
      }

      box.querySelector('[data-role="cancel"]').addEventListener('click', () => close(false));
      box.querySelector('[data-role="confirm"]').addEventListener('click', () => close(true));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
      });
    });
  };
})();
