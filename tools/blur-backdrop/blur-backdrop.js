document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileStatus = document.getElementById("file-status");

  const blurRadius = document.getElementById("blur-radius");
  const valBlur = document.getElementById("val-blur");
  const brightness = document.getElementById("brightness");
  const valBrightness = document.getElementById("val-brightness");
  const contrast = document.getElementById("contrast");
  const valContrast = document.getElementById("val-contrast");
  const saturation = document.getElementById("saturation");
  const valSaturation = document.getElementById("val-saturation");

  const canvasPreview = document.getElementById("canvas-preview");
  const noCanvasText = document.getElementById("no-canvas-text");
  const btnDownload = document.getElementById("btn-download");

  let uploadedImage = null; // HTML Image element

  function renderBackdrop() {
    if (!uploadedImage) return;

    const ctx = canvasPreview.getContext("2d");

    // Make canvas dimensions identical to raw loaded image
    canvasPreview.width = uploadedImage.width;
    canvasPreview.height = uploadedImage.height;

    const bVal = parseInt(blurRadius.value);
    const brVal = parseInt(brightness.value);
    const cVal = parseInt(contrast.value);
    const sVal = parseInt(saturation.value);

    ctx.clearRect(0, 0, canvasPreview.width, canvasPreview.height);

    // Apply CSS/Canvas 2D filter rules
    ctx.filter = `blur(${bVal}px) brightness(${brVal}%) contrast(${cVal}%) saturate(${sVal}%)`;

    // To prevent transparent/vignette edges caused by canvas Gaussian blur,
    // draw the image slightly larger than the canvas if blur is active.
    if (bVal > 0) {
      const scaleFactor = 1 + (bVal * 2) / canvasPreview.width;
      const w = canvasPreview.width * scaleFactor;
      const h = canvasPreview.height * scaleFactor;
      const x = (canvasPreview.width - w) / 2;
      const y = (canvasPreview.height - h) / 2;
      ctx.drawImage(uploadedImage, x, y, w, h);
    } else {
      ctx.drawImage(uploadedImage, 0, 0);
    }
  }

  // Bind slider controls
  blurRadius.addEventListener("input", () => {
    valBlur.textContent = `${blurRadius.value}px`;
    renderBackdrop();
  });

  brightness.addEventListener("input", () => {
    valBrightness.textContent = `${brightness.value}%`;
    renderBackdrop();
  });

  contrast.addEventListener("input", () => {
    valContrast.textContent = `${contrast.value}%`;
    renderBackdrop();
  });

  saturation.addEventListener("input", () => {
    valSaturation.textContent = `${saturation.value}%`;
    renderBackdrop();
  });

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        uploadedImage = img;
        fileStatus.textContent = `${img.width}x${img.height} px`;
        noCanvasText.style.display = "none";
        canvasPreview.style.display = "block";
        btnDownload.disabled = false;
        renderBackdrop();
        showToast("Image loaded! Apply filters to preview.", "success");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--color-primary)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "";
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  btnDownload.addEventListener("click", () => {
    if (!uploadedImage) return;

    try {
      const url = canvasPreview.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "blurred_backdrop.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!", "success");
    } catch (e) {
      showToast("Download failed: " + e.message, "error");
    }
  });
});
