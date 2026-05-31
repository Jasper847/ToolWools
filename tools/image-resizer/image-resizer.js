document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const controls = document.getElementById('controls');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const lockRatio = document.getElementById('lock-ratio');
  const formatSelect = document.getElementById('format');
  const btnResize = document.getElementById('btn-resize');
  const info = document.getElementById('info');

  let img = null;
  let aspectRatio = 1;

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
        widthInput.value = img.naturalWidth;
        heightInput.value = img.naturalHeight;
        aspectRatio = img.naturalWidth / img.naturalHeight;
        info.textContent = `Original: ${img.naturalWidth} × ${img.naturalHeight}px`;
        controls.style.display = 'block';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  widthInput.addEventListener('input', () => { if (lockRatio.checked && img) heightInput.value = Math.round(widthInput.value / aspectRatio); });
  heightInput.addEventListener('input', () => { if (lockRatio.checked && img) widthInput.value = Math.round(heightInput.value * aspectRatio); });

  btnResize.addEventListener('click', () => {
    if (!img) { showToast('Upload an image first.', 'warning'); return; }
    const w = parseInt(widthInput.value) || img.naturalWidth;
    const h = parseInt(heightInput.value) || img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);

    const mime = formatSelect.value;
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const ext = mime.split('/')[1];
      a.download = `resized_${w}x${h}.${ext}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      showToast(`Image resized to ${w}×${h} and downloaded.`, 'success');
    }, mime, 0.92);
  });
});
