/* Image Resizer — Enhanced JS (Phase 5) */
document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput  = document.getElementById('file-input');
  const controls   = document.getElementById('controls');
  const widthEl    = document.getElementById('width');
  const heightEl   = document.getElementById('height');
  const lockRatio  = document.getElementById('lock-ratio');
  const formatEl   = document.getElementById('format');
  const qualityEl  = document.getElementById('quality');
  const qualityVal = document.getElementById('quality-val');
  const scalePct   = document.getElementById('scale-pct');
  const previewImg = document.getElementById('preview-img');
  const resizeInfo = document.getElementById('resize-info');

  let images = [];         // Array of {file, img, origW, origH}
  let ratio  = 1;
  let lockAspect = true;

  // Show/hide quality slider
  formatEl.addEventListener('change', () => {
    document.getElementById('quality-wrap').style.display = formatEl.value === 'image/png' ? 'none' : '';
  });
  qualityEl.addEventListener('input', () => { qualityVal.textContent = qualityEl.value; });

  // Lock ratio toggle
  lockRatio.addEventListener('change', () => { lockAspect = lockRatio.checked; });

  // Width/height sync
  widthEl.addEventListener('input', () => {
    if (lockAspect && images.length > 0) {
      heightEl.value = Math.round(parseInt(widthEl.value) / ratio);
    }
  });
  heightEl.addEventListener('input', () => {
    if (lockAspect && images.length > 0) {
      widthEl.value = Math.round(parseInt(heightEl.value) * ratio);
    }
  });

  // Preset buttons
  document.getElementById('preset-btns').addEventListener('click', e => {
    const btn = e.target.closest('[data-preset]');
    if (!btn) return;
    const [w, h] = btn.dataset.preset.split('x').map(Number);
    widthEl.value = w;
    heightEl.value = h;
    lockRatio.checked = false;
    lockAspect = false;
    document.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('action-btn--active'));
    btn.classList.add('action-btn--active');
  });

  // Scale by %
  document.getElementById('btn-apply-pct').addEventListener('click', () => {
    if (images.length === 0) { showToast('Upload an image first.', 'warning'); return; }
    const pct = parseFloat(scalePct.value) / 100;
    widthEl.value  = Math.round(images[0].origW * pct);
    heightEl.value = Math.round(images[0].origH * pct);
  });

  // Upload
  function formatBytes(b) {
    if (b < 1024) return b + 'B';
    if (b < 1048576) return (b/1024).toFixed(1) + 'KB';
    return (b/1048576).toFixed(1) + 'MB';
  }

  function loadFiles(files) {
    images = [];
    let loaded = 0;
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) { showToast('Please upload image files.', 'warning'); return; }

    arr.forEach(file => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        images.push({ file, img, origW: img.naturalWidth, origH: img.naturalHeight, url });
        loaded++;
        if (loaded === arr.length) {
          // Use first image for preview/dims
          const first = images[0];
          ratio = first.origW / first.origH;
          widthEl.value  = first.origW;
          heightEl.value = first.origH;
          lockAspect = true;
          lockRatio.checked = true;
          document.getElementById('orig-w').textContent  = first.origW + 'px';
          document.getElementById('orig-h').textContent  = first.origH + 'px';
          document.getElementById('file-size').textContent = formatBytes(first.file.size);
          document.getElementById('file-count').textContent = images.length;
          previewImg.src = first.url;
          previewImg.style.display = 'block';
          controls.style.display = '';
          showToast(`${images.length} image${images.length > 1 ? 's' : ''} loaded.`, 'success');
        }
      };
      img.src = url;
    });
  }

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  fileInput.addEventListener('change', () => loadFiles(fileInput.files));
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    loadFiles(e.dataTransfer.files);
  });

  // Resize & Download
  document.getElementById('btn-resize').addEventListener('click', () => {
    if (!images.length) { showToast('Upload images first.', 'warning'); return; }
    const w    = parseInt(widthEl.value);
    const h    = parseInt(heightEl.value);
    const fmt  = formatEl.value;
    const qual = parseFloat(qualityEl.value) / 100;
    if (!w || !h || w < 1 || h < 1) { showToast('Enter valid dimensions.', 'warning'); return; }

    const ext = fmt === 'image/png' ? 'png' : fmt === 'image/webp' ? 'webp' : 'jpg';

    images.forEach(({ img, file }, i) => {
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        const name = file.name.replace(/\.[^.]+$/, '');
        a.href = url;
        a.download = `${name}-${w}x${h}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
        if (i === 0) {
          resizeInfo.textContent = `Resized to ${w}×${h} | ${formatBytes(blob.size)}`;
          showToast(`Downloaded ${images.length > 1 ? `${i+1}/${images.length}` : ''} image!`, 'success');
        }
      }, fmt, qual);
    });
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    images = [];
    fileInput.value = '';
    controls.style.display = 'none';
    previewImg.style.display = 'none';
    resizeInfo.textContent = '';
  });
});
