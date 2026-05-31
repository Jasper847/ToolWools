document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileInfoRow = document.getElementById("file-info-row");
  const fileName = document.getElementById("file-name");
  const filePagesCount = document.getElementById("file-pages-count");
  const btnRemove = document.getElementById("btn-remove");

  const rotateSettings = document.getElementById("rotate-settings");
  const rotateGrid = document.getElementById("rotate-grid");
  const customPagesWrapper = document.getElementById("custom-pages-wrapper");
  const customPagesInput = document.getElementById("custom-pages");
  const btnRotate = document.getElementById("btn-rotate");

  let uploadedPdfBytes = null;
  let totalPages = 0;
  let selectedAngle = 90; // Default 90 degrees

  // Rotation card clicks
  rotateGrid.querySelectorAll(".rotate-card").forEach(card => {
    card.addEventListener("click", () => {
      rotateGrid.querySelectorAll(".rotate-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedAngle = parseInt(card.getAttribute("data-angle"));
    });
  });

  // Scope selection change
  document.querySelectorAll("input[name='scope']").forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "custom") {
        customPagesWrapper.style.display = "block";
      } else {
        customPagesWrapper.style.display = "none";
      }
    });
  });

  function parsePageRanges(rangeStr, maxPage) {
    const pages = [];
    const parts = rangeStr.split(",");
    
    for (let part of parts) {
      part = part.trim();
      if (part.includes("-")) {
        const limits = part.split("-");
        const start = parseInt(limits[0]);
        const end = parseInt(limits[1]);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPage) {
              pages.push(i - 1);
            }
          }
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= maxPage) {
          pages.push(page - 1);
        }
      }
    }
    
    return Array.from(new Set(pages));
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please upload a valid PDF document.", "error");
      return;
    }

    fileName.textContent = file.name;
    filePagesCount.textContent = `Reading metadata... • ${Math.round(file.size / 1024)} KB`;
    fileInfoRow.style.display = "flex";

    try {
      const arrayBuffer = await file.arrayBuffer();
      uploadedPdfBytes = new Uint8Array(arrayBuffer);

      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      totalPages = pdfDoc.getPageCount();

      filePagesCount.textContent = `${totalPages} pages • ${Math.round(file.size / 1024)} KB`;
      rotateSettings.style.display = "block";
      showToast("PDF document loaded successfully!", "success");
    } catch (e) {
      showToast("Failed to load PDF: " + e.message, "error");
      fileInfoRow.style.display = "none";
      rotateSettings.style.display = "none";
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

  btnRemove.addEventListener("click", () => {
    fileInput.value = "";
    uploadedPdfBytes = null;
    totalPages = 0;
    fileInfoRow.style.display = "none";
    rotateSettings.style.display = "none";
    customPagesInput.value = "";
    showToast("PDF removed.", "info");
  });

  btnRotate.addEventListener("click", async () => {
    if (!uploadedPdfBytes) return;

    btnRotate.disabled = true;
    btnRotate.textContent = "Rotating Pages...";

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      const pages = pdfDoc.getPages();
      const scopeVal = document.querySelector("input[name='scope']:checked").value;

      let pagesToRotate = [];
      if (scopeVal === "all") {
        for (let i = 0; i < totalPages; i++) {
          pagesToRotate.push(i);
        }
      } else {
        const customText = customPagesInput.value.trim();
        if (!customText) {
          showToast("Please specify page numbers to rotate.", "warning");
          btnRotate.disabled = false;
          btnRotate.textContent = "Apply Rotation and Save";
          return;
        }
        pagesToRotate = parsePageRanges(customText, totalPages);
        if (pagesToRotate.length === 0) {
          showToast("No valid page numbers found in range settings.", "error");
          btnRotate.disabled = false;
          btnRotate.textContent = "Apply Rotation and Save";
          return;
        }
      }

      pagesToRotate.forEach(index => {
        const page = pages[index];
        // Calculate new degrees: original + rotation delta (multiple of 90 degrees)
        const currentRotation = page.getRotation().angle;
        const newRotation = (currentRotation + selectedAngle) % 360;
        page.setRotation(PDFLib.degrees(newRotation));
      });

      const rotatedBytes = await pdfDoc.save();
      const blob = new Blob([rotatedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "rotated_document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast("PDF pages rotated and downloaded successfully!", "success");
    } catch (e) {
      showToast("Failed to rotate PDF: " + e.message, "error");
    } finally {
      btnRotate.disabled = false;
      btnRotate.textContent = "Apply Rotation and Save";
    }
  });
});
