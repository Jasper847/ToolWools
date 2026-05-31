document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const sizeSlider = document.getElementById('size');
  const sizeVal = document.getElementById('size-val');
  const btnGenerate = document.getElementById('btn-generate');
  const btnDownload = document.getElementById('btn-download');
  const wrapper = document.getElementById('qr-canvas-wrapper');

  let qrInstance = null;

  sizeSlider.addEventListener('input', () => { sizeVal.textContent = sizeSlider.value; });

  function generate() {
    const text = input.value.trim();
    if (!text) { showToast('Enter text or URL to generate a QR code.', 'warning'); return; }
    const size = parseInt(sizeSlider.value);

    // Clear previous
    wrapper.innerHTML = '';
    const div = document.createElement('div');
    wrapper.appendChild(div);

    // qrcode.js renders into a div as either canvas or img
    qrInstance = new QRCode(div, {
      text: text,
      width: size,
      height: size,
      colorDark: '#1A1A2E',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.H
    });
    showToast('QR Code generated!', 'success');
  }

  btnGenerate.addEventListener('click', generate);

  btnDownload.addEventListener('click', () => {
    const canvas = wrapper.querySelector('canvas');
    const img = wrapper.querySelector('img');
    let dataUrl = '';
    if (canvas) { dataUrl = canvas.toDataURL('image/png'); }
    else if (img) { dataUrl = img.src; }
    else { showToast('Generate a QR code first.', 'warning'); return; }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'toolwools-qrcode.png';
    a.click();
    showToast('QR code downloaded!', 'success');
  });

  // Auto-generate on load
  generate();
});
