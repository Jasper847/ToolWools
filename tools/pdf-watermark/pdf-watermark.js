document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const filePagesCount = document.getElementById("file-pages-count");
  
  const settingsGroup = document.getElementById("settings-group");
  const watermarkText = document.getElementById("watermark-text");
  const fontSizeSlider = document.getElementById("font-size");
  const valFontSize = document.getElementById("val-font-size");
  const opacitySlider = document.getElementById("opacity-slider");
  const valOpacity = document.getElementById("val-opacity");
  const angleSlider = document.getElementById("angle-slider");
  const valAngle = document.getElementById("val-angle");
  const textColor = document.getElementById("text-color");

  const noFileInfo = document.getElementById("no-file-info");
  const fileLoadedInfo = document.getElementById("file-loaded-info");
  const infoName = document.getElementById("info-name");
  const infoPages = document.getElementById("info-pages");
  const btnWatermark = document.getElementById("btn-watermark");

  let uploadedPdfBytes = null;
  let totalPages = 0;

  // Bind slider controls
  fontSizeSlider.addEventListener("input", () => {
    valFontSize.textContent = `${fontSizeSlider.value}pt`;
  });
  opacitySlider.addEventListener("input", () => {
    valOpacity.textContent = `${opacitySlider.value}%`;
  });
  angleSlider.addEventListener("input", () => {
    valAngle.textContent = `${angleSlider.value}°`;
  });

  function hexToRgbRatio(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please upload a valid PDF document.", "error");
      return;
    }

    filePagesCount.textContent = `Reading...`;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      uploadedPdfBytes = new Uint8Array(arrayBuffer);

      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      totalPages = pdfDoc.getPageCount();

      filePagesCount.textContent = `${totalPages} pages`;
      infoName.textContent = file.name;
      infoPages.textContent = `${totalPages} pages • ${Math.round(file.size / 1024)} KB`;

      noFileInfo.style.display = "none";
      fileLoadedInfo.style.display = "block";
      settingsGroup.style.display = "block";

      showToast("PDF document loaded!", "success");
    } catch (e) {
      showToast("Failed to load PDF: " + e.message, "error");
      noFileInfo.style.display = "block";
      fileLoadedInfo.style.display = "none";
      settingsGroup.style.display = "none";
    }
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

  btnWatermark.addEventListener("click", async () => {
    if (!uploadedPdfBytes) return;

    const stampText = watermarkText.value.trim();
    if (!stampText) {
      showToast("Please enter watermark text.", "warning");
      return;
    }

    btnWatermark.disabled = true;
    btnWatermark.textContent = "Applying Watermark...";

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      
      // Embed standard Helvetica font
      const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      
      const size = parseInt(fontSizeSlider.value);
      const opacity = parseInt(opacitySlider.value) / 100;
      const angle = parseInt(angleSlider.value);
      const color = hexToRgbRatio(textColor.value);

      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // Compute text width to center it accurately
        const textWidth = helveticaFont.widthOfTextAtSize(stampText, size);
        const textHeight = size; // rough height estimate

        // Coordinates centered
        const x = width / 2 - textWidth / 2;
        const y = height / 2 - textHeight / 2;

        page.drawText(stampText, {
          x,
          y,
          size,
          font: helveticaFont,
          color: PDFLib.rgb(color.r, color.g, color.b),
          opacity,
          rotate: PDFLib.degrees(angle),
          // Set text origin point to center for correct rotation behavior
          xAnchor: "center",
          yAnchor: "middle"
        });
      });

      const watermarkedBytes = await pdfDoc.save();
      const blob = new Blob([watermarkedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "watermarked_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Watermark successfully stamped on all pages!", "success");
    } catch (e) {
      showToast("PDF Watermarking failed: " + e.message, "error");
    } finally {
      btnWatermark.disabled = false;
      btnWatermark.textContent = "Apply Watermark & Download";
    }
  });
});
