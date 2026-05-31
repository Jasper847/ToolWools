document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const imageInput = document.getElementById('image-input');
  const dropZone = document.getElementById('drop-zone');
  const scaleWidth = document.getElementById('scale-width');
  const scaleHeight = document.getElementById('scale-height');
  const aspectLock = document.getElementById('aspect-lock');
  const qualityRange = document.getElementById('quality-range');
  const qualityVal = document.getElementById('quality-val');
  const qualityWrapper = document.getElementById('quality-wrapper');

  // Format cards
  const formatCards = document.querySelectorAll('.format-card');

  // Preview & details
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const canvasPlaceholder = document.getElementById('canvas-placeholder');
  const origDetails = document.getElementById('orig-details');
  const outFormatVal = document.getElementById('out-format-val');
  const outSizeVal = document.getElementById('out-size-val');
  const btnDownload = document.getElementById('btn-download');

  const copyToast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');

  // State
  let sourceImage = null;
  let originalWidth = 0;
  let originalHeight = 0;
  let aspectRatio = 1;
  let originalFileName = 'image';
  let originalFileSize = 0;
  let targetFormat = 'png';
  let currentOutputBlob = null;

  // --- DRAG & DROP HANDLERS ---
  dropZone.addEventListener('click', () => {
    imageInput.click();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      loadImage(e.dataTransfer.files[0]);
    }
  });

  imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      loadImage(e.target.files[0]);
    }
  });

  // --- IMAGE LOADING SYSTEM ---
  function loadImage(file) {
    if (!file.type.startsWith('image/')) {
      alert('File is not a supported image type.');
      return;
    }

    originalFileName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    originalFileSize = file.size;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        sourceImage = img;
        originalWidth = img.width;
        originalHeight = img.height;
        aspectRatio = originalWidth / originalHeight;

        // Populate fields
        scaleWidth.value = originalWidth;
        scaleHeight.value = originalHeight;

        // Enable inputs
        scaleWidth.disabled = false;
        scaleHeight.disabled = false;
        aspectLock.disabled = false;

        // Set dimensions info label
        const sizeStr = formatBytes(originalFileSize);
        origDetails.textContent = `${file.type.split('/')[1].toUpperCase()}, ${originalWidth}x${originalHeight}px (${sizeStr})`;

        // Hide placeholder
        canvasPlaceholder.style.display = 'none';
        canvas.style.display = 'block';

        // Perform initial conversion
        processImage();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- FORMAT SIZE HELPER ---
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // --- ASPECT RATIO UPDATES ---
  scaleWidth.addEventListener('input', () => {
    if (!sourceImage) return;
    const w = parseInt(scaleWidth.value) || 0;
    if (aspectLock.checked && w > 0) {
      scaleHeight.value = Math.round(w / aspectRatio);
    }
    processImage();
  });

  scaleHeight.addEventListener('input', () => {
    if (!sourceImage) return;
    const h = parseInt(scaleHeight.value) || 0;
    if (aspectLock.checked && h > 0) {
      scaleWidth.value = Math.round(h * aspectRatio);
    }
    processImage();
  });

  qualityRange.addEventListener('input', (e) => {
    qualityVal.textContent = e.target.value;
    processImage();
  });

  // --- FORMAT CARD SELECTORS ---
  formatCards.forEach(card => {
    card.addEventListener('click', () => {
      formatCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      targetFormat = card.getAttribute('data-format');
      outFormatVal.textContent = targetFormat.toUpperCase();

      // Show quality controls only for compression formats (jpg, webp)
      if (targetFormat === 'jpeg' || targetFormat === 'webp') {
        qualityWrapper.style.display = 'block';
      } else {
        qualityWrapper.style.display = 'none';
      }

      processImage();
    });
  });

  // --- CONVERSION LOGIC ROUTINES ---
  function processImage() {
    if (!sourceImage) return;

    const w = parseInt(scaleWidth.value) || originalWidth;
    const h = parseInt(scaleHeight.value) || originalHeight;

    canvas.width = w;
    canvas.height = h;

    // Draw image with scaling onto canvas
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(sourceImage, 0, 0, w, h);

    const quality = parseFloat(qualityRange.value) / 100;

    // Convert depending on target
    if (targetFormat === 'png') {
      canvas.toBlob((blob) => {
        saveBlobOutput(blob);
      }, 'image/png');
    } else if (targetFormat === 'jpeg') {
      canvas.toBlob((blob) => {
        saveBlobOutput(blob);
      }, 'image/jpeg', quality);
    } else if (targetFormat === 'webp') {
      canvas.toBlob((blob) => {
        saveBlobOutput(blob);
      }, 'image/webp', quality);
    } else if (targetFormat === 'ico') {
      // ICO files are packaged from PNG images
      canvas.toBlob((pngBlob) => {
        if (!pngBlob) return;
        const icoBlob = createIcoBlob(pngBlob, w, h);
        saveBlobOutput(icoBlob);
      }, 'image/png');
    }
  }

  function saveBlobOutput(blob) {
    if (!blob) return;
    currentOutputBlob = blob;
    outSizeVal.textContent = formatBytes(blob.size);
    btnDownload.disabled = false;
  }

  // --- ICO CONTAINER BUILDER IN JS ---
  function createIcoBlob(pngBlob, width, height) {
    const pngSize = pngBlob.size;
    const buffer = new ArrayBuffer(22);
    const view = new DataView(buffer);
    
    // Header
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // Type: 1 = ICO
    view.setUint16(4, 1, true); // Number of images
    
    // Directory entry
    view.setUint8(6, width >= 256 ? 0 : width); // Width
    view.setUint8(7, height >= 256 ? 0 : height); // Height
    view.setUint8(8, 0); // Color palette
    view.setUint8(9, 0); // Reserved
    view.setUint16(10, 1, true); // Color planes
    view.setUint16(12, 32, true); // Bits per pixel
    view.setUint32(14, pngSize, true); // Image size in bytes
    view.setUint32(18, 22, true); // Image data offset (22 bytes header)
    
    return new Blob([buffer, pngBlob], { type: 'image/x-icon' });
  }

  // --- DOWNLOAD ACTION ---
  btnDownload.addEventListener('click', () => {
    if (!currentOutputBlob) return;

    const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
    const downloadName = `${originalFileName}.${extension}`;

    const anchor = document.createElement('a');
    anchor.download = downloadName;
    anchor.href = window.URL.createObjectURL(currentOutputBlob);
    anchor.dataset.downloadurl = [currentOutputBlob.type, anchor.download, anchor.href].join(':');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Show toast message
    toastMessage.textContent = 'Image successfully converted & downloaded!';
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 3000);
  });
});
