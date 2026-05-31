/* QR Code Generator — Enhanced JS (Phase 5) */
document.addEventListener('DOMContentLoaded', () => {
  const preview    = document.getElementById('qr-preview');
  const canvas     = document.getElementById('qr-canvas');
  const placeholder = document.getElementById('qr-placeholder');
  const sizeSlider = document.getElementById('size');
  const sizeVal    = document.getElementById('size-val');
  const colorDark  = document.getElementById('color-dark');
  const colorLight = document.getElementById('color-light');
  const correction = document.getElementById('correction');

  let currentType = 'url';
  let qrInstance  = null;

  // Tab switching
  document.getElementById('type-tabs').addEventListener('click', e => {
    const btn = e.target.closest('[data-type]');
    if (!btn) return;
    currentType = btn.dataset.type;
    document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('action-btn--active'));
    btn.classList.add('action-btn--active');
    ['url','text','email','phone','sms','wifi','vcard'].forEach(t => {
      const el = document.getElementById('input-' + t);
      if (el) el.style.display = t === currentType ? '' : 'none';
    });
  });

  sizeSlider.addEventListener('input', () => { sizeVal.textContent = sizeSlider.value; });

  function buildQRData() {
    switch (currentType) {
      case 'url':   return document.getElementById('url-input').value.trim() || 'https://toolwools.com';
      case 'text':  return document.getElementById('text-input').value.trim() || '';
      case 'email': {
        const to = document.getElementById('email-to').value.trim();
        const sub = encodeURIComponent(document.getElementById('email-subject').value.trim());
        const body = encodeURIComponent(document.getElementById('email-body').value.trim());
        return `mailto:${to}?subject=${sub}&body=${body}`;
      }
      case 'phone': return `tel:${document.getElementById('phone-input').value.trim()}`;
      case 'sms': {
        const num = document.getElementById('sms-number').value.trim();
        const msg = encodeURIComponent(document.getElementById('sms-message').value.trim());
        return `smsto:${num}:${msg}`;
      }
      case 'wifi': {
        const ssid = document.getElementById('wifi-ssid').value.trim();
        const pass = document.getElementById('wifi-pass').value;
        const enc  = document.getElementById('wifi-enc').value;
        const hidden = document.getElementById('wifi-hidden').checked ? 'true' : 'false';
        return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
      }
      case 'vcard': {
        const name  = document.getElementById('vc-name').value.trim();
        const org   = document.getElementById('vc-org').value.trim();
        const email = document.getElementById('vc-email').value.trim();
        const phone = document.getElementById('vc-phone').value.trim();
        const url   = document.getElementById('vc-url').value.trim();
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nURL:${url}\nEND:VCARD`;
      }
      default: return '';
    }
  }

  function generate() {
    const data = buildQRData();
    if (!data) { showToast('Please fill in the required fields.', 'warning'); return; }

    const size = parseInt(sizeSlider.value);
    const corrMap = { H: QRCode.CorrectLevel.H, Q: QRCode.CorrectLevel.Q, M: QRCode.CorrectLevel.M, L: QRCode.CorrectLevel.L };

    // Clear
    const container = document.createElement('div');
    placeholder.style.display = 'none';
    canvas.style.display = 'none';

    // Use qrcode.js to render
    qrInstance = new QRCode(container, {
      text: data,
      width: size,
      height: size,
      colorDark: colorDark.value,
      colorLight: colorLight.value,
      correctLevel: corrMap[correction.value] || QRCode.CorrectLevel.H
    });

    // Get the rendered canvas from qrcode.js
    setTimeout(() => {
      const qrCanvas = container.querySelector('canvas');
      if (qrCanvas) {
        canvas.width  = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(qrCanvas, 0, 0);
        canvas.style.display = 'block';
        showToast('QR Code generated!', 'success');
      } else {
        // Fallback: use img
        const qrImg = container.querySelector('img');
        if (qrImg) {
          canvas.style.display = 'none';
          // show img directly
          placeholder.innerHTML = '';
          placeholder.appendChild(qrImg);
          placeholder.style.display = 'flex';
        }
      }
    }, 100);
  }

  document.getElementById('btn-generate').addEventListener('click', generate);

  // Auto-generate on load
  setTimeout(generate, 200);

  document.getElementById('btn-download-png').addEventListener('click', () => {
    if (canvas.style.display === 'none') { showToast('Generate a QR code first.', 'warning'); return; }
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `toolwools-qr-${currentType}.png`;
    a.click();
    showToast('PNG downloaded!', 'success');
  });

  document.getElementById('btn-download-svg').addEventListener('click', () => {
    if (canvas.style.display === 'none') { showToast('Generate a QR code first.', 'warning'); return; }
    const size = parseInt(sizeSlider.value);
    const dataUrl = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image href="${dataUrl}" width="${size}" height="${size}"/></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolwools-qr-${currentType}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('SVG downloaded!', 'success');
  });

  document.getElementById('btn-copy-svg').addEventListener('click', () => {
    if (canvas.style.display === 'none') { showToast('Generate a QR code first.', 'warning'); return; }
    const size = parseInt(sizeSlider.value);
    const dataUrl = canvas.toDataURL('image/png');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image href="${dataUrl}" width="${size}" height="${size}"/></svg>`;
    navigator.clipboard.writeText(svg).then(() => showToast('SVG copied to clipboard!', 'success'));
  });
});
