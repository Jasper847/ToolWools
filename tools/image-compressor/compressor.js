/* =============================================
   TOOLWOOLS — Image Compressor Logic (Premium)
   Supports client-side image compression using Canvas
   Handles drag-and-drop uploads, formats, quality slider,
   byte savings calculation, side-by-side comparison,
   and memory-leak safe downloads.
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
  const compareWrapper = document.getElementById('compareWrapper');
  
  const valOrigSize = document.getElementById('valOrigSize');
  const valOrigDim = document.getElementById('valOrigDim');
  const valNewSize = document.getElementById('valNewSize');
  const valNewDim = document.getElementById('valNewDim');
  const valSavingsPercent = document.getElementById('valSavingsPercent');
  const valSavingsBytes = document.getElementById('valSavingsBytes');
  
  const btnDownload = document.getElementById('btnDownload');
  const btnDownloadReset = document.getElementById('btnDownloadReset');

  // State Variables
  let originalFile = null;
  let originalImage = null; // HTMLImageElement
  let originalUrl = null;
  let compressedUrl = null;
  let compressTimeout = null;

  // ==========================================
  // 1. DRAG AND DROP & UPLOAD EVENT LISTENERS
  // ==========================================

  // Open file selector on upload zone click
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle file input selection
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag over upload zone styling
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  // ==========================================
  // 2. CORE FILE HANDLING
  // ==========================================
  function handleFile(file) {
    // Validate file type (must be image)
    if (!file.type.match('image.*')) {
      alert('Unsupported file type. Please upload an image (PNG, JPG, WEBP).');
      return;
    }

    // Set active state variables
    originalFile = file;
    
    // Revoke old object URLs to prevent memory leak
    cleanupUrls();

    // Display file row meta details
    fileName.textContent = file.name;
    fileSize.textContent = formatBytes(file.size);
    
    uploadZone.style.display = 'none';
    fileRow.style.display = 'flex';

    // Transition loading overlay state
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    miniProgressFill.style.width = '20%';

    // Load file into an image element for Canvas manipulation
    originalUrl = URL.createObjectURL(file);
    originalImage = new Image();
    
    originalImage.onload = () => {
      miniProgressFill.style.width = '60%';
      // Enable controls panel
      controlsWrapper.style.opacity = '1';
      controlsWrapper.style.pointerEvents = 'all';
      
      // Trigger automatic compression
      compressImage();
    };

    originalImage.onerror = () => {
      alert('Error loading image. Please try another file.');
      resetState();
    };

    originalImage.src = originalUrl;
  }

  // ==========================================
  // 3. CANVAS COMPRESSION ALGORITHM
  // ==========================================
  function compressImage() {
    if (!originalFile || !originalImage) return;

    // Show loading UI
    resultsContent.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    miniProgressFill.style.width = '70%';

    // Get Target Format MimeType
    let selectedFormat = 'original';
    for (const radio of formatOptions) {
      if (radio.checked) {
        selectedFormat = radio.value;
        break;
      }
    }

    let mimeType = originalFile.type;
    if (selectedFormat !== 'original') {
      mimeType = selectedFormat;
    }

    // Standardize mimeTypes (some browsers might not support certain output conversions)
    // JPEG/WEBP are widely supported, PNG is supported.
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!supportedTypes.includes(mimeType)) {
      mimeType = 'image/jpeg'; // fallback
    }

    // Get Compression Quality (range 0 to 1)
    const quality = parseInt(qualitySlider.value, 10) / 100;

    // Setup HTML5 Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Maintain full dimensions
    canvas.width = originalImage.naturalWidth;
    canvas.height = originalImage.naturalHeight;

    // Premium detail: Handle transparent PNG conversion to JPG
    if (mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'; // White background prevents black margins in transparency
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw image onto canvas
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    miniProgressFill.style.width = '90%';

    // Perform canvas.toBlob compression
    canvas.toBlob((blob) => {
      if (!blob) {
        alert('Compression failed. Try a smaller quality range or alternative format.');
        loadingOverlay.style.display = 'none';
        return;
      }

      miniProgressFill.style.width = '100%';

      // Revoke previous compressed URL
      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }

      // Generate new URL for the compressed blob
      compressedUrl = URL.createObjectURL(blob);

      // Render original and compressed images to comparison viewports
      compareOriginal.src = originalUrl;
      compareCompressed.src = compressedUrl;

      // Reset compare slider to 50% split view
      if (compareSlider && compareCompressed) {
        compareSlider.style.left = '50%';
        compareCompressed.style.clipPath = 'inset(0 0 0 50%)';
      }

      // Calculate Metrics and Byte Savings
      const originalBytes = originalFile.size;
      const compressedBytes = blob.size;
      const savingsBytes = originalBytes - compressedBytes;
      let savingsPercent = Math.max(0, Math.round((savingsBytes / originalBytes) * 100));

      // Update Dashboard Metric Cards
      valOrigSize.textContent = formatBytes(originalBytes);
      valOrigDim.textContent = `${originalImage.naturalWidth} x ${originalImage.naturalHeight}px`;

      valNewSize.textContent = formatBytes(compressedBytes);
      valNewDim.textContent = `${originalImage.naturalWidth} x ${originalImage.naturalHeight}px`;

      // Configure Savings display (handle cases where compression increases size slightly)
      if (savingsBytes <= 0) {
        valSavingsPercent.textContent = '0%';
        valSavingsBytes.textContent = 'Already fully optimized';
        valSavingsPercent.classList.remove('text-success-green');
      } else {
        valSavingsPercent.textContent = `${savingsPercent}%`;
        valSavingsBytes.textContent = `${formatBytes(savingsBytes)} saved`;
        valSavingsPercent.classList.add('text-success-green');
      }

      // Wire Download Link Button
      let extension = mimeType.split('/')[1] || 'jpg';
      if (extension === 'jpeg') extension = 'jpg';
      
      // Construct a clean filename
      const baseName = originalFile.name.substring(0, originalFile.name.lastIndexOf('.')) || originalFile.name;
      const cleanDownloadName = `${baseName}_optimized.${extension}`;
      
      btnDownload.href = compressedUrl;
      btnDownload.setAttribute('download', cleanDownloadName);

      // Transition layouts (hide spinner, show workspace dashboard)
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
        resultsContent.style.display = 'block';
      }, 200);

    }, mimeType, quality);
  }

  // ==========================================
  // 4. CONTROL INTERACTIONS & ANIMATIONS
  // ==========================================

  // Live quality slider interaction with debounce to keep CPU usage highly efficient
  qualitySlider.addEventListener('input', (e) => {
    const value = e.target.value;
    qualityVal.textContent = `${value}%`;

    clearTimeout(compressTimeout);
    compressTimeout = setTimeout(() => {
      compressImage();
    }, 120); // 120ms debounce
  });

  // Re-run compression instantly on format radio toggle
  formatOptions.forEach(radio => {
    radio.addEventListener('change', () => {
      compressImage();
    });
  });

  // Manual Trigger
  btnCompress.addEventListener('click', () => {
    clearTimeout(compressTimeout);
    compressImage();
  });

  // Reset System Trigger
  btnReset.addEventListener('click', resetState);
  btnDownloadReset.addEventListener('click', resetState);

  // ==========================================
  // 5. MEMORY AND CONVENIENCE HELPERS
  // ==========================================

  function resetState() {
    cleanupUrls();
    originalFile = null;
    originalImage = null;
    
    // Clear Input file node values
    fileInput.value = '';
    
    // Revert visual layouts
    fileRow.style.display = 'none';
    uploadZone.style.display = 'block';
    
    // Disable controls panel
    controlsWrapper.style.opacity = '0.5';
    controlsWrapper.style.pointerEvents = 'none';
    
    // Reset quality to default 80
    qualitySlider.value = 80;
    qualityVal.textContent = '80%';
    
    // Reset format radios to 'original'
    formatOptions[0].checked = true;

    // Reset results dashboard view
    resultsContent.style.display = 'none';
    loadingOverlay.style.display = 'none';
    resultsPlaceholder.style.display = 'block';
  }

  function cleanupUrls() {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
      originalUrl = null;
    }
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
      compressedUrl = null;
    }
  }

  // ==========================================
  // 6. COMPARISON SLIDER DRAG LOGIC
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
      
      let x = pageX - rect.left;
      
      // Constrain inside bounds
      if (x < 0) x = 0;
      if (x > rect.width) x = rect.width;
      
      const percentage = (x / rect.width) * 100;
      
      // Update slider handle position
      compareSlider.style.left = `${percentage}%`;
      // Update clipped width of compressed image
      compareCompressed.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    };

    const startDragging = (e) => {
      e.preventDefault();
      isDragging = true;
      imageCompareContainer.classList.add('dragging');
      document.addEventListener('mousemove', drag);
      document.addEventListener('touchmove', drag);
    };

    const stopDragging = () => {
      if (!isDragging) return;
      isDragging = false;
      imageCompareContainer.classList.remove('dragging');
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
    };

    // Listen on handle click and drag
    compareSlider.addEventListener('mousedown', startDragging);
    compareSlider.addEventListener('touchstart', startDragging, { passive: false });

    // Stop drag globally
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);
  }

  initCompareSlider();

  // Byte size formatter utility
  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
});
