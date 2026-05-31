document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const imageContainer = document.getElementById("image-container");
  
  const pageSize = document.getElementById("page-size");
  const pageMargin = document.getElementById("page-margin");
  
  const btnConvert = document.getElementById("btn-convert");
  const btnClear = document.getElementById("btn-clear");
  
  const noPdfText = document.getElementById("no-pdf-text");
  const compileStatus = document.getElementById("compile-status");
  const pdfSummaryTitle = document.getElementById("pdf-summary-title");
  const pdfSummaryDesc = document.getElementById("pdf-summary-desc");
  const btnDownload = document.getElementById("btn-download");

  let uploadedImages = []; // Array of { id, file, src, img }
  let nextImageId = 0;
  let compiledPdfBytes = null;

  function updateImageList() {
    if (uploadedImages.length === 0) {
      imageContainer.innerHTML = `<div style="color: var(--color-muted); text-align: center; padding: 24px;">No images uploaded yet</div>`;
      btnConvert.disabled = true;
      return;
    }

    btnConvert.disabled = false;
    imageContainer.innerHTML = "";

    uploadedImages.forEach((imgObj, idx) => {
      const row = document.createElement("div");
      row.className = "image-row";
      row.innerHTML = `
        <div class="image-thumbnail-wrap">
          <img src="${imgObj.src}" class="image-thumb">
          <div class="image-meta">
            <div>Page ${idx + 1}</div>
            <div style="font-size:11px;color:var(--color-muted)">${imgObj.file.name}</div>
          </div>
        </div>
        <div class="image-controls">
          <button class="btn btn-secondary btn-move-up" data-id="${imgObj.id}" ${idx === 0 ? "disabled" : ""} style="padding: 4px 8px; font-size: 11px;">↑</button>
          <button class="btn btn-secondary btn-move-down" data-id="${imgObj.id}" ${idx === uploadedImages.length - 1 ? "disabled" : ""} style="padding: 4px 8px; font-size: 11px;">↓</button>
          <button class="btn btn-secondary btn-remove-image" data-id="${imgObj.id}" style="padding: 4px 8px; font-size: 11px; color: var(--color-red); border-color: var(--color-red-light)">✖</button>
        </div>
      `;
      imageContainer.appendChild(row);
    });

    // Wire up order modifications
    imageContainer.querySelectorAll(".btn-move-up").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const idx = uploadedImages.findIndex(item => item.id === id);
        if (idx > 0) {
          const temp = uploadedImages[idx];
          uploadedImages[idx] = uploadedImages[idx - 1];
          uploadedImages[idx - 1] = temp;
          updateImageList();
        }
      });
    });

    imageContainer.querySelectorAll(".btn-move-down").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const idx = uploadedImages.findIndex(item => item.id === id);
        if (idx < uploadedImages.length - 1) {
          const temp = uploadedImages[idx];
          uploadedImages[idx] = uploadedImages[idx + 1];
          uploadedImages[idx + 1] = temp;
          updateImageList();
        }
      });
    });

    imageContainer.querySelectorAll(".btn-remove-image").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        uploadedImages = uploadedImages.filter(item => item.id !== id);
        updateImageList();
        showToast("Page removed.", "info");
      });
    });
  }

  function handleFiles(filesList) {
    let promises = [];
    
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (!file.type.startsWith("image/")) continue;

      const p = new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            uploadedImages.push({
              id: nextImageId++,
              file: file,
              src: e.target.result,
              img: img
            });
            resolve();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
      promises.push(p);
    }

    Promise.all(promises).then(() => {
      updateImageList();
      showToast(`${promises.length} image(s) added!`, "success");
    });
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
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
      handleFiles(e.dataTransfer.files);
    }
  });

  btnClear.addEventListener("click", () => {
    uploadedImages = [];
    compiledPdfBytes = null;
    updateImageList();
    noPdfText.style.display = "block";
    compileStatus.style.display = "none";
    showToast("Cleared images.", "info");
  });

  btnConvert.addEventListener("click", async () => {
    if (uploadedImages.length === 0) return;

    btnConvert.disabled = true;
    btnConvert.textContent = "Compiling PDF...";

    try {
      const pdfDoc = await PDFLib.PDFDocument.create();
      const margin = parseInt(pageMargin.value);
      const sizeMode = pageSize.value;

      for (let i = 0; i < uploadedImages.length; i++) {
        const imgObj = uploadedImages[i];
        
        // Convert image to JPEG using Canvas to ensure it works for JPG/PNG/WEBP/GIF
        const canvas = document.createElement("canvas");
        canvas.width = imgObj.img.width;
        canvas.height = imgObj.img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(imgObj.img, 0, 0);

        const jpegBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.9));
        const jpegBytes = await jpegBlob.arrayBuffer();

        const embeddedImage = await pdfDoc.embedJpg(jpegBytes);

        let pageWidth = 0;
        let pageHeight = 0;

        if (sizeMode === "fit") {
          pageWidth = imgObj.img.width + margin * 2;
          pageHeight = imgObj.img.height + margin * 2;
        } else if (sizeMode === "A4") {
          pageWidth = 595.27; // A4 width in points
          pageHeight = 841.89; // A4 height in points
        } else if (sizeMode === "letter") {
          pageWidth = 612.0; // Letter width in points
          pageHeight = 792.0; // Letter height in points
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Draw image, fitting inside A4/Letter margins if size bounds are fixed
        if (sizeMode === "fit") {
          page.drawImage(embeddedImage, {
            x: margin,
            y: margin,
            width: imgObj.img.width,
            height: imgObj.img.height
          });
        } else {
          // Fit image to bounds conserving aspect ratio
          const fitW = pageWidth - margin * 2;
          const fitH = pageHeight - margin * 2;
          
          const scale = Math.min(fitW / imgObj.img.width, fitH / imgObj.img.height);
          const w = imgObj.img.width * scale;
          const h = imgObj.img.height * scale;
          const x = margin + (fitW - w) / 2;
          const y = margin + (fitH - h) / 2;

          page.drawImage(embeddedImage, {
            x, y,
            width: w,
            height: h
          });
        }
      }

      compiledPdfBytes = await pdfDoc.save();

      const kbSize = Math.round(compiledPdfBytes.byteLength / 1024);
      pdfSummaryTitle.textContent = "PDF Successfully Created!";
      pdfSummaryDesc.textContent = `${uploadedImages.length} page(s) • ${kbSize} KB`;

      noPdfText.style.display = "none";
      compileStatus.style.display = "block";
      showToast("PDF document compiled successfully!", "success");
    } catch (e) {
      showToast("Failed to compile PDF: " + e.message, "error");
    } finally {
      btnConvert.disabled = false;
      btnConvert.textContent = "Generate PDF";
    }
  });

  btnDownload.addEventListener("click", () => {
    if (!compiledPdfBytes) return;

    try {
      const blob = new Blob([compiledPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "compiled_images.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!", "success");
    } catch (e) {
      showToast("Download failed: " + e.message, "error");
    }
  });
});
