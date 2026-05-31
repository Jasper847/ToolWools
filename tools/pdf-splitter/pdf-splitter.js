document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileInfoRow = document.getElementById("file-info-row");
  const fileName = document.getElementById("file-name");
  const filePagesCount = document.getElementById("file-pages-count");
  const btnRemove = document.getElementById("btn-remove");
  
  const splitSettings = document.getElementById("split-settings");
  const modeAll = document.getElementById("mode-all");
  const modeRange = document.getElementById("mode-range");
  const rangeInputWrapper = document.getElementById("range-input-wrapper");
  const rangeInput = document.getElementById("range-input");
  
  const btnSplit = document.getElementById("btn-split");

  let uploadedPdfBytes = null;
  let totalPages = 0;
  let currentMode = "all"; // "all" | "range"

  // Toggle splitting modes
  modeAll.addEventListener("click", () => {
    modeAll.classList.add("active");
    modeRange.classList.remove("active");
    rangeInputWrapper.style.display = "none";
    currentMode = "all";
  });

  modeRange.addEventListener("click", () => {
    modeRange.classList.add("active");
    modeAll.classList.remove("active");
    rangeInputWrapper.style.display = "block";
    currentMode = "range";
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
              pages.push(i - 1); // pdf-lib copies using 0-indexed page bounds
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
    
    // Sort and keep unique page numbers
    return Array.from(new Set(pages)).sort((a, b) => a - b);
  }

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please upload a valid PDF document.", "error");
      return;
    }

    fileName.textContent = file.name;
    filePagesCount.textContent = `Loading pages... • ${Math.round(file.size / 1024)} KB`;
    fileInfoRow.style.display = "flex";

    try {
      const arrayBuffer = await file.arrayBuffer();
      uploadedPdfBytes = new Uint8Array(arrayBuffer);

      // Load PDF using pdf-lib to count total pages
      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);
      totalPages = pdfDoc.getPageCount();

      filePagesCount.textContent = `${totalPages} pages • ${Math.round(file.size / 1024)} KB`;
      splitSettings.style.display = "block";
      showToast("PDF document loaded successfully!", "success");
    } catch (e) {
      showToast("Failed to load PDF: " + e.message, "error");
      fileInfoRow.style.display = "none";
      splitSettings.style.display = "none";
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
    splitSettings.style.display = "none";
    rangeInput.value = "";
    showToast("PDF removed.", "info");
  });

  btnSplit.addEventListener("click", async () => {
    if (!uploadedPdfBytes) return;

    btnSplit.disabled = true;
    btnSplit.textContent = "Processing PDF...";

    try {
      const pdfDoc = await PDFLib.PDFDocument.load(uploadedPdfBytes);

      if (currentMode === "all") {
        if (!window.JSZip) {
          throw new Error("ZIP encoding library did not load correctly.");
        }

        const zip = new JSZip();

        for (let i = 0; i < totalPages; i++) {
          const singlePageDoc = await PDFLib.PDFDocument.create();
          const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
          singlePageDoc.addPage(copiedPage);
          const singleBytes = await singlePageDoc.save();
          
          zip.file(`page_${i + 1}.pdf`, singleBytes);
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "split_pages.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("PDF split into individual pages and downloaded as ZIP!", "success");
      } else {
        // Range extraction mode
        const rangeText = rangeInput.value.trim();
        if (!rangeText) {
          showToast("Please enter a page range (e.g. 1-3, 5).", "warning");
          btnSplit.disabled = false;
          btnSplit.textContent = "Execute Split PDF";
          return;
        }

        const pagesToCopy = parsePageRanges(rangeText, totalPages);
        if (pagesToCopy.length === 0) {
          showToast("No valid page numbers found in range settings.", "error");
          btnSplit.disabled = false;
          btnSplit.textContent = "Execute Split PDF";
          return;
        }

        const rangeDoc = await PDFLib.PDFDocument.create();
        const copiedPages = await rangeDoc.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach(p => rangeDoc.addPage(p));
        const rangeBytes = await rangeDoc.save();

        const pdfBlob = new Blob([rangeBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "extracted_pages.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("Requested page ranges successfully extracted!", "success");
      }
    } catch (e) {
      showToast("PDF Processing Error: " + e.message, "error");
    } finally {
      btnSplit.disabled = false;
      btnSplit.textContent = "Execute Split PDF";
    }
  });
});
