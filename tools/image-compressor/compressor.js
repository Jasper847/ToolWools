/* =============================================
   TOOLWOOLS — Image Compressor Logic (Phase 2)
   Supports:
   - Batch upload (up to 50 files via drag-and-drop or picker)
   - Per-file Canvas compression with quality slider
   - Output format: Original / JPEG / PNG / WEBP
   - Before/after comparison slider (single file)
   - Individual download per file
   - "Download All as ZIP" via JSZip
   - Memory-leak safe blob management
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  const fileRow = document.getElementById('fileRow');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const btnReset = document.getElementById('btnReset');

  const controlsWrapper = document.getElementById('controlsWrapper');
  const qualitySlider = document.getElementById('qualitySlider');
  const qualityVal = document.getElementById('qualityVal');
  const formatOptions = document.getElementsByName('formatOption');
  const btnCompress = document.getElementById('btnCompress');

  const resultsPlaceholder = document.getElementById('resultsPlaceholder');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const miniProgressFill = document.getElementById('miniProgressFill');
  const resultsContent = document.getElementById('resultsContent');

  const compareOriginal = document.getElementById('compareOriginal');
  const compareCompressed = document.getElementById('compareCompressed');
  const compareSlider = document.getElementById('compareSlider');

  const valOrigSize = document.getElementById('valOrigSize');
  const valOrigDim = document.getElementById('valOrigDim');
  const valNewSize = document.getElementById('valNewSize');
  const valNewDim = document.getElementById('valNewDim');
  const valSavingsPercent = document.getElementById('valSavingsPercent');
  const valSavingsBytes = document.getElementById('valSavingsBytes');

  const btnDownload = document.getElementById('btnDownload');
  const btnDownloadReset = document.getElementById('btnDownloadReset');

  // === STATE ===
  const MAX_FILES = 50;
  let fileQueue = []; // [{file, image, originalUrl, compressedUrl, compressedBlob, fileName}]
  let activeIndex = 0;
  let compressTimeout = null;

  // ==========================================
  // 1. UPLOAD HANDLERS
  // ==========================================
  uploadZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFiles(Array.from(e.target.files));
  });

  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFiles(Array.from(e.dataTransfer.files));
  });

  // ==========================================
  // 2. BATCH FILE HANDLING
  // ==========================================
  function handleFiles(files) {
    const images = files.filter(f => f.type.match('image.*'));
    if (images.length === 0) {
      showToast('No supported image files found. Please upload PNG, JPG, or WEBP.', 'error');
      return;
    }
    if (images.length > MAX_FILES) {
      showToast(`Maximum ${MAX_FILES} files allowed. Only the first ${MAX_FILES} will be processed.`, 'warning');
      images.length = MAX_FILES;
    }

    // Reset previous state
    cleanupAll();
    fileQueue = [];
    activeIndex = 0;

    // Build queue
    images.forEach(file => {
      fileQueue.push({ file, image: null, originalUrl: null, compressedUrl: null, compressedBlob: null, fileName: file.name });
    });

    // Update UI
    const label = fileQueue.length === 1
      ? fileQueue[0].file.name
      : `${fileQueue.length} images selected`;
    const totalSize = fileQueue.reduce((s, f) => s + f.file.size, 0);

    fileName.textContent = label;
    fileSize.textContent = formatBytes(totalSize);
    uploadZone.style.display = 'none';
    fileRow.style.display = 'flex';

    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    miniProgressFill.style.width = '10%';

    controlsWrapper.style.opacity = '1';
    controlsWrapper.style.pointerEvents = 'all';

    // Load all images then compress
    loadAllImages();
  }

  function loadAllImages() {
    let loaded = 0;
    fileQueue.forEach((item, idx) => {
      item.originalUrl = URL.createObjectURL(item.file);
      item.image = new Image();
      item.image.onload = () => {
        loaded++;
        miniProgressFill.style.width = `${10 + Math.round((loaded / fileQueue.length) * 40)}%`;
        if (loaded === fileQueue.length) compressAll();
      };
      item.image.onerror = () => {
        loaded++;
        showToast(`Could not load "${item.file.name}". Skipping.`, 'warning');
        fileQueue.splice(idx, 1);
        if (loaded === fileQueue.length) {
          if (fileQueue.length === 0) { resetState(); return; }
          compressAll();
        }
      };
      item.image.src = item.originalUrl;
    });
  }

  // ==========================================
  // 3. COMPRESSION ENGINE
  // ==========================================
  function getTargetMime() {
    let selected = 'original';
    for (const radio of formatOptions) { if (radio.checked) { selected = radio.value; break; } }
    if (selected === 'original') return null; // use source type
    const supported = ['image/jpeg', 'image/png', 'image/webp'];
    return supported.includes(selected) ? selected : 'image/jpeg';
  }

  function compressAll() {
    loadingOverlay.style.display = 'flex';
    resultsContent.style.display = 'none';
    miniProgressFill.style.width = '55%';

    const quality = parseInt(qualitySlider.value, 10) / 100;
    let done = 0;

    fileQueue.forEach((item) => {
      const mimeType = getTargetMime() || item.file.type || 'image/jpeg';
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = item.image.naturalWidth;
      canvas.height = item.image.naturalHeight;

      if (mimeType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(item.image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
        item.compressedBlob = blob || new Blob([], {type: mimeType});
        item.compressedUrl = URL.createObjectURL(item.compressedBlob);

        // Build clean download name
        let ext = mimeType.split('/')[1] || 'jpg';
        if (ext === 'jpeg') ext = 'jpg';
        const baseName = item.file.name.substring(0, item.file.name.lastIndexOf('.')) || item.file.name;
        item.downloadName = `${baseName}_optimized.${ext}`;

        done++;
        miniProgressFill.style.width = `${55 + Math.round((done / fileQueue.length) * 40)}%`;
        if (done === fileQueue.length) onAllCompressed();
      }, mimeType, quality);
    });
  }

  function onAllCompressed() {
    miniProgressFill.style.width = '100%';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
      resultsContent.style.display = 'block';
      showStats(0);
    }, 200);
  }

  // ==========================================
  // 4. DISPLAY STATS FOR ACTIVE FILE
  // ==========================================
  function showStats(idx) {
    if (!fileQueue[idx]) return;
    activeIndex = idx;
    const item = fileQueue[idx];
    const origBytes = item.file.size;
    const compBytes = item.compressedBlob ? item.compressedBlob.size : 0;
    const saved = origBytes - compBytes;
    const pct = origBytes > 0 ? Math.max(0, Math.round((saved / origBytes) * 100)) : 0;

    valOrigSize.textContent = formatBytes(origBytes);
    valOrigDim.textContent = `${item.image.naturalWidth} x ${item.image.naturalHeight}px`;
    valNewSize.textContent = formatBytes(compBytes);
    valNewDim.textContent = `${item.image.naturalWidth} x ${item.image.naturalHeight}px`;

    if (saved <= 0) {
      valSavingsPercent.textContent = '0%';
      valSavingsBytes.textContent = 'Already optimized';
      valSavingsPercent.classList.remove('text-success-green');
    } else {
      valSavingsPercent.textContent = `${pct}%`;
      valSavingsBytes.textContent = `${formatBytes(saved)} saved`;
      valSavingsPercent.classList.add('text-success-green');
    }

    // Comparison images
    if (compareOriginal) compareOriginal.src = item.originalUrl;
    if (compareCompressed) compareCompressed.src = item.compressedUrl;
    if (compareSlider && compareCompressed) {
      compareSlider.style.left = '50%';
      compareCompressed.style.clipPath = 'inset(0 0 0 50%)';
    }

    // Download button — single or ZIP
    if (fileQueue.length === 1) {
      btnDownload.href = item.compressedUrl;
      btnDownload.setAttribute('download', item.downloadName);
      btnDownload.textContent = 'Download';
    } else {
      btnDownload.removeAttribute('href');
      btnDownload.removeAttribute('download');
      btnDownload.textContent = `Download All (${fileQueue.length}) as ZIP`;
    }
  }

  // ==========================================
  // 5. DOWNLOAD — SINGLE OR ZIP
  // ==========================================
  btnDownload.addEventListener('click', (e) => {
    if (fileQueue.length <= 1) return; // single file uses native <a> download

    e.preventDefault();
    if (typeof JSZip === 'undefined') {
      showToast('ZIP library not loaded. Please refresh and try again.', 'error');
      return;
    }

    const zip = new JSZip();
    fileQueue.forEach(item => {
      if (item.compressedBlob) zip.file(item.downloadName, item.compressedBlob);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'toolwools_optimized_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showToast(`${fileQueue.length} images compressed and zipped successfully!`, 'success');
    });
  });

  // ==========================================
  // 6. CONTROLS
  // ==========================================
  qualitySlider.addEventListener('input', (e) => {
    qualityVal.textContent = `${e.target.value}%`;
    clearTimeout(compressTimeout);
    compressTimeout = setTimeout(() => compressAll(), 150);
  });

  formatOptions.forEach(radio => radio.addEventListener('change', () => compressAll()));
  btnCompress.addEventListener('click', () => { clearTimeout(compressTimeout); compressAll(); });
  btnReset.addEventListener('click', resetState);
  btnDownloadReset.addEventListener('click', resetState);

  // ==========================================
  // 7. CLEANUP & HELPERS
  // ==========================================
  function resetState() {
    cleanupAll();
    fileQueue = [];
    activeIndex = 0;
    fileInput.value = '';
    fileRow.style.display = 'none';
    uploadZone.style.display = 'block';
    controlsWrapper.style.opacity = '0.5';
    controlsWrapper.style.pointerEvents = 'none';
    qualitySlider.value = 80;
    qualityVal.textContent = '80%';
    formatOptions[0].checked = true;
    resultsContent.style.display = 'none';
    loadingOverlay.style.display = 'none';
    resultsPlaceholder.style.display = 'block';
  }

  function cleanupAll() {
    fileQueue.forEach(item => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
  }

  // ==========================================
  // 8. COMPARISON SLIDER
  // ==========================================
  let isDragging = false;
  const imageCompareContainer = document.getElementById('imageCompare');

  function initCompareSlider() {
    if (!compareSlider || !imageCompareContainer || !compareCompressed) return;

    const drag = (e) => {
      if (!isDragging) return;
      const rect = imageCompareContainer.getBoundingClientRect();
      let pageX = e.pageX || (e.touches && e.touches[0].pageX);
      if (pageX === undefined) return;
      let x = Math.max(0, Math.min(pageX - rect.left, rect.width));
      const pct = (x / rect.width) * 100;
      compareSlider.style.left = `${pct}%`;
      compareCompressed.style.clipPath = `inset(0 0 0 ${pct}%)`;
    };

    const startDrag = (e) => { e.preventDefault(); isDragging = true; imageCompareContainer.classList.add('dragging'); document.addEventListener('mousemove', drag); document.addEventListener('touchmove', drag); };
    const stopDrag = () => { if (!isDragging) return; isDragging = false; imageCompareContainer.classList.remove('dragging'); document.removeEventListener('mousemove', drag); document.removeEventListener('touchmove', drag); };

    compareSlider.addEventListener('mousedown', startDrag);
    compareSlider.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
  }
  initCompareSlider();

  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
});
