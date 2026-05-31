document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileInfoRow = document.getElementById("file-info-row");
  const fileName = document.getElementById("file-name");
  const fileResolution = document.getElementById("file-resolution");
  const btnRemove = document.getElementById("btn-remove");
  const btnConvert = document.getElementById("btn-convert");
  const sizeOptions = document.getElementById("size-options");

  let uploadedImage = null; // HTML Image element

  // Checkbox Card Toggles
  const cards = sizeOptions.querySelectorAll(".size-checkbox-card");
  cards.forEach(card => {
    card.addEventListener("click", (e) => {
      // Prevent double trigger if clicking directly on checkbox input
      if (e.target.tagName.toLowerCase() === "input") return;
      const checkbox = card.querySelector("input");
      checkbox.checked = !checkbox.checked;
      card.classList.toggle("active", checkbox.checked);
    });
    
    const checkbox = card.querySelector("input");
    checkbox.addEventListener("change", () => {
      card.classList.toggle("active", checkbox.checked);
    });
  });

  function handleFile(file) {
    if (!file) return;
    if (!file.type.match("image/png") && !file.type.match("image/jpeg") && !file.type.match("image/webp")) {
      showToast("Only PNG, JPEG, and WebP files are supported.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        uploadedImage = img;
        fileName.textContent = file.name;
        fileResolution.textContent = `${img.width} x ${img.height} px • ${Math.round(file.size / 1024)} KB`;
        
        fileInfoRow.style.display = "flex";
        btnConvert.disabled = false;
        showToast("Image loaded successfully!", "success");
      };
      img.onerror = () => {
        showToast("Error loading image file.", "error");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Setup file input listeners
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  // Drag and Drop
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

  btnRemove.addEventListener("click", () => {
    uploadedImage = null;
    fileInput.value = "";
    fileInfoRow.style.display = "none";
    btnConvert.disabled = true;
    showToast("Image removed.", "info");
  });

  async function generateICOFile(imgElement, sizes) {
    const pngBuffers = [];

    for (let size of sizes) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      // Draw resized image
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgElement, 0, 0, size, size);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      const arrayBuffer = await blob.arrayBuffer();
      pngBuffers.push(new Uint8Array(arrayBuffer));
    }

    const count = pngBuffers.length;
    const headerSize = 6 + count * 16;
    let totalSize = headerSize;
    pngBuffers.forEach(buf => { totalSize += buf.byteLength; });

    const icoBuffer = new Uint8Array(totalSize);
    const view = new DataView(icoBuffer.buffer);

    // ICONDIR Header
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // Type (1 = ICO)
    view.setUint16(4, count, true); // Image count

    let currentOffset = headerSize;
    for (let i = 0; i < count; i++) {
      const size = sizes[i];
      const pngBuf = pngBuffers[i];
      const entryOffset = 6 + i * 16;

      // ICONDIRENTRY Header
      view.setUint8(entryOffset + 0, size === 256 ? 0 : size); // Width (0 means 256)
      view.setUint8(entryOffset + 1, size === 256 ? 0 : size); // Height (0 means 256)
      view.setUint8(entryOffset + 2, 0); // Palette color count
      view.setUint8(entryOffset + 3, 0); // Reserved
      view.setUint16(entryOffset + 4, 1, true); // Color planes (1)
      view.setUint16(entryOffset + 6, 32, true); // Bits per pixel (32)
      view.setUint32(entryOffset + 8, pngBuf.byteLength, true); // Image data size
      view.setUint32(entryOffset + 12, currentOffset, true); // Image data offset

      icoBuffer.set(pngBuf, currentOffset);
      currentOffset += pngBuf.byteLength;
    }

    return new Blob([icoBuffer], { type: "image/x-icon" });
  }

  btnConvert.addEventListener("click", async () => {
    if (!uploadedImage) return;

    // Collect selected sizes
    const selectedSizes = [];
    const checkboxes = sizeOptions.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(cb => {
      if (cb.checked) {
        selectedSizes.push(parseInt(cb.value));
      }
    });

    if (selectedSizes.length === 0) {
      showToast("Please select at least one size.", "warning");
      return;
    }

    // Sort sizes ascending so 16x16 is first (common convention)
    selectedSizes.sort((a, b) => a - b);

    btnConvert.disabled = true;
    btnConvert.textContent = "Converting...";

    try {
      const icoBlob = await generateICOFile(uploadedImage, selectedSizes);
      const url = URL.createObjectURL(icoBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "favicon.ico";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Favicon.ico successfully created!", "success");
    } catch (e) {
      showToast("Conversion failed: " + e.message, "error");
    } finally {
      btnConvert.disabled = false;
      btnConvert.textContent = "Convert and Download .ICO";
    }
  });
});
