document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const btnMerge = document.getElementById('btn-merge');
  const btnClear = document.getElementById('btn-clear');
  const status = document.getElementById('status');

  let files = [];

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); addFiles(Array.from(e.dataTransfer.files)); });
  fileInput.addEventListener('change', e => { addFiles(Array.from(e.target.files)); fileInput.value = ''; });

  function addFiles(newFiles) {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfs.length === 0) { showToast('Please select PDF files only.', 'error'); return; }
    files = files.concat(pdfs);
    renderList();
  }

  function renderList() {
    fileList.innerHTML = files.map((f, i) => `<li class="file-list-item"><span>${i + 1}. ${f.name} (${(f.size / 1024).toFixed(1)} KB)</span><button class="btn-remove" data-idx="${i}">&times;</button></li>`).join('');
    fileList.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => { files.splice(parseInt(btn.dataset.idx), 1); renderList(); });
    });
    btnMerge.disabled = files.length < 2;
    status.textContent = files.length > 0 ? `${files.length} file(s) ready` : '';
  }

  btnClear.addEventListener('click', () => { files = []; renderList(); });

  btnMerge.addEventListener('click', async () => {
    if (files.length < 2) { showToast('Add at least 2 PDFs to merge.', 'warning'); return; }
    btnMerge.disabled = true;
    status.textContent = 'Merging...';

    try {
      const merged = await PDFLib.PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }
      const output = await merged.save();
      const blob = new Blob([output], { type: 'application/pdf' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'merged.pdf';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      status.textContent = 'Merged successfully!';
      showToast(`${files.length} PDFs merged and downloaded.`, 'success');
    } catch (err) {
      status.textContent = 'Merge failed.';
      showToast('Error merging PDFs: ' + err.message, 'error');
    } finally { btnMerge.disabled = false; }
  });
});
