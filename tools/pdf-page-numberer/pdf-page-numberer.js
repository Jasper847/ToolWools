document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const filePagesCount = document.getElementById("file-pages-count");
  
  const settingsGroup = document.getElementById("settings-group");
  const numberFormat = document.getElementById("number-format");
  const numberPosition = document.getElementById("number-position");
  const startNumberInput = document.getElementById("start-number");
  const fontSizeSlider = document.getElementById("font-size");
  const valFontSize = document.getElementById("val-font-size");
  const textColor = document.getElementById("text-color");

  const noFileInfo = document.getElementById("no-file-info");
  const fileLoadedInfo = document.getElementById("file-loaded-info");
  const infoName = document.getElementById("info-name");
  const infoPages = document.getElementById("info-pages");
  const btnNumber = document.getElementById("btn-number");

  let uploadedPdfBytes = null;
  let totalPages = 0;

  fontSizeSlider.addEventListener("input", () => {
    valFontSize.textContent = `${fontSizeSlider.value}pt`;
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

      showToast("PDF document loaded successfully!", "success");
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

  btnNumber.addEventListener("click", async () => {
    if (!uploadedPdfBytes) return;

    btnNumber.disabled = true;
    btnNumber.textContent = "Numbering Pages...";

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      
      const format = numberFormat.value;
      const position = numberPosition.value;
      const startNum = parseInt(startNumberInput.value) || 1;
      const fontSize = parseInt(fontSizeSlider.value);
      const color = hexToRgbRatio(textColor.value);

      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const currentPageNumber = startNum + index;
        
        let label = "";
        if (format === "simple") {
          label = String(currentPageNumber);
        } else if (format === "prefix") {
          label = `Page ${currentPageNumber}`;
        } else if (format === "of") {
          label = `Page ${currentPageNumber} of ${totalPages}`;
        }

        const textWidth = helveticaFont.widthOfTextAtSize(label, fontSize);
        const textHeight = fontSize;

        let x = width / 2 - textWidth / 2; // Default horizontal center
        let y = 20; // Default vertical footer margin

        // Position coordinates formatting
        switch (position) {
          case "bottom-left":
            x = 30;
            y = 30;
            break;
          case "bottom-center":
            x = width / 2 - textWidth / 2;
            y = 30;
            break;
          case "bottom-right":
            x = width - textWidth - 30;
            y = 30;
            break;
          case "top-left":
            x = 30;
            y = height - textHeight - 30;
            break;
          case "top-center":
            x = width / 2 - textWidth / 2;
            y = height - textHeight - 30;
            break;
          case "top-right":
            x = width - textWidth - 30;
            y = height - textHeight - 30;
            break;
        }

        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: PDFLib.rgb(color.r, color.g, color.b)
        });
      });

      const numberedBytes = await pdfDoc.save();
      const blob = new Blob([numberedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "numbered_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("Page numbers successfully added to PDF!", "success");
    } catch (e) {
      showToast("Failed to number PDF: " + e.message, "error");
    } finally {
      btnNumber.disabled = false;
      btnNumber.textContent = "Apply Page Numbers";
    }
  });
});
