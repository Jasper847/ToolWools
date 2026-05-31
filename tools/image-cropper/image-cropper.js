document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const controls = document.getElementById('controls');
  const cropX = document.getElementById('crop-x');
  const cropY = document.getElementById('crop-y');
  const cropW = document.getElementById('crop-w');
  const cropH = document.getElementById('crop-h');
  const btnCrop = document.getElementById('btn-crop');
  const previewCanvas = document.getElementById('preview-canvas');
  const ctx = previewCanvas.getContext('2d');

  let img = null;

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); loadImage(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) loadImage(e.target.files[0]); });

  function loadImage(file) {
    if (!file || !file.type.startsWith('image/')) { showToast('Please select an image file.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      img = new Image();
      img.onload = () => {
        cropW.value = img.naturalWidth;
        cropH.value = img.naturalHeight;
        cropX.value = 0;
        cropY.value = 0;
        controls.style.display = 'block';
        drawPreview();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function drawPreview() {
    if (!img) return;
    previewCanvas.width = img.naturalWidth;
    previewCanvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
  }

  btnCrop.addEventListener('click', () => {
    if (!img) { showToast('Upload an image first.', 'warning'); return; }
    const x = parseInt(cropX.value) || 0;
    const y = parseInt(cropY.value) || 0;
    const w = parseInt(cropW.value) || img.naturalWidth;
    const h = parseInt(cropH.value) || img.naturalHeight;

    if (x + w > img.naturalWidth || y + h > img.naturalHeight) {
      showToast('Crop area exceeds image bounds.', 'error');
      return;
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext('2d');
    outCtx.drawImage(img, x, y, w, h, 0, 0, w, h);

    outCanvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cropped_${w}x${h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      showToast(`Image cropped to ${w}×${h} and downloaded.`, 'success');
    }, 'image/png');
  });

  // Live preview on input change
  [cropX, cropY, cropW, cropH].forEach(el => el.addEventListener('input', drawPreview));
});
