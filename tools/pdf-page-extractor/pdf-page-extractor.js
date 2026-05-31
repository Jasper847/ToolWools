document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const controls = document.getElementById('controls');
  const pageInfo = document.getElementById('page-info');
  const pagesInput = document.getElementById('pages-input');
  const btnExtract = document.getElementById('btn-extract');

  let pdfBytes = null;
  let totalPages = 0;

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); loadFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });

  async function loadFile(file) {
    if (!file || file.type !== 'application/pdf') { showToast('Please select a PDF file.', 'error'); return; }
    pdfBytes = await file.arrayBuffer();
    const doc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    totalPages = doc.getPageCount();
    pageInfo.textContent = `Document has ${totalPages} page(s)`;
    controls.style.display = 'block';
  }

  function parsePageRanges(str, max) {
    const indices = new Set();
    str.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number);
        for (let i = Math.max(1, a); i <= Math.min(max, b); i++) indices.add(i - 1);
      } else {
        const n = parseInt(part);
        if (n >= 1 && n <= max) indices.add(n - 1);
      }
    });
    return Array.from(indices).sort((a, b) => a - b);
  }

  btnExtract.addEventListener('click', async () => {
    if (!pdfBytes) { showToast('Upload a PDF first.', 'warning'); return; }
    const indices = parsePageRanges(pagesInput.value, totalPages);
    if (indices.length === 0) { showToast('Enter valid page numbers (e.g. 1,3,5-8).', 'warning'); return; }

    try {
      const src = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const dest = await PDFLib.PDFDocument.create();
      const pages = await dest.copyPages(src, indices);
      pages.forEach(p => dest.addPage(p));
      const output = await dest.save();
      const blob = new Blob([output], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `extracted_pages.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      showToast(`Extracted ${indices.length} page(s) successfully.`, 'success');
    } catch (err) { showToast('Extraction failed: ' + err.message, 'error'); }
  });
});
