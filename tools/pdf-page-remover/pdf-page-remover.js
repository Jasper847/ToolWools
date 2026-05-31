document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileInfoRow = document.getElementById("file-info-row");
  const fileName = document.getElementById("file-name");
  const filePagesCount = document.getElementById("file-pages-count");
  const btnRemove = document.getElementById("btn-remove");

  const removeSettings = document.getElementById("remove-settings");
  const pagesToRemoveInput = document.getElementById("pages-to-remove");
  const btnRemovePages = document.getElementById("btn-remove-pages");

  let uploadedPdfBytes = null;
  let totalPages = 0;

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
    filePagesCount.textContent = `Loading metadata... • ${Math.round(file.size / 1024)} KB`;
    fileInfoRow.style.display = "flex";

    try {
      const arrayBuffer = await file.arrayBuffer();
      uploadedPdfBytes = new Uint8Array(arrayBuffer);

      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      totalPages = pdfDoc.getPageCount();

      filePagesCount.textContent = `${totalPages} pages • ${Math.round(file.size / 1024)} KB`;
      removeSettings.style.display = "block";
      showToast("PDF document loaded successfully!", "success");
    } catch (e) {
      showToast("Failed to load PDF: " + e.message, "error");
      fileInfoRow.style.display = "none";
      removeSettings.style.display = "none";
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
    removeSettings.style.display = "none";
    pagesToRemoveInput.value = "";
    showToast("PDF removed.", "info");
  });

  btnRemovePages.addEventListener("click", async () => {
    if (!uploadedPdfBytes) return;

    const removeText = pagesToRemoveInput.value.trim();
    if (!removeText) {
      showToast("Please specify page numbers to remove.", "warning");
      return;
    }

    const pagesToRemove = parsePageRanges(removeText, totalPages);
    if (pagesToRemove.length === 0) {
      showToast("No valid page numbers found in input ranges.", "error");
      return;
    }

    if (pagesToRemove.length === totalPages) {
      showToast("You cannot remove all pages from a PDF. Keep at least 1 page.", "warning");
      return;
    }

    btnRemovePages.disabled = true;
    btnRemovePages.textContent = "Removing Pages...";

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      
      // Sort page indices in descending order so deletion does not shift indices
      pagesToRemove.sort((a, b) => b - a);

      pagesToRemove.forEach(index => {
        pdfDoc.removePage(index);
      });

      const cleanedBytes = await pdfDoc.save();
      const blob = new Blob([cleanedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pages_removed.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Removed ${pagesToRemove.length} page(s) successfully!`, "success");
    } catch (e) {
      showToast("PDF Processing Error: " + e.message, "error");
    } finally {
      btnRemovePages.disabled = false;
      btnRemovePages.textContent = "Remove Pages & Save PDF";
    }
  });
});
