/* PDF Merger — Enhanced JS (Phase 5) */
document.addEventListener('DOMContentLoaded', () => {
  const uploadZone    = document.getElementById('upload-zone');
  const fileInput     = document.getElementById('file-input');
  const fileListEl    = document.getElementById('file-list');
  const fileListSec   = document.getElementById('file-list-section');
  const btnMerge      = document.getElementById('btn-merge');
  const btnClear      = document.getElementById('btn-clear');
  const btnAddMore    = document.getElementById('btn-add-more');
  const progressWrap  = document.getElementById('progress-wrap');
  const progressBar   = document.getElementById('progress-bar');
  const statusText    = document.getElementById('status-text');
  const outputName    = document.getElementById('output-name');

  let pdfFiles = []; // Array of {file, bytes, pageCount}
  let dragSrc  = null;

  function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
    return (b/1048576).toFixed(1) + ' MB';
  }

  function updateStats() {
    document.getElementById('stat-files').textContent = pdfFiles.length;
    const totalSize = pdfFiles.reduce((a, f) => a + f.file.size, 0);
    const totalPages = pdfFiles.reduce((a, f) => a + (f.pageCount || 0), 0);
    document.getElementById('stat-pages').textContent = totalPages || '—';
    document.getElementById('stat-size').textContent = formatBytes(totalSize);
    document.getElementById('file-count').textContent = pdfFiles.length;
  }

  function renderList() {
    fileListEl.innerHTML = '';
    pdfFiles.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'file-list-item';
      li.draggable = true;
      li.dataset.idx = idx;
      li.innerHTML = `
        <span style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
          <span style="cursor:grab;color:var(--color-muted);flex-shrink:0" aria-hidden="true">⠿</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--color-red)" stroke-width="1.5"/><path d="M14 2v6h6" stroke="var(--color-red)" stroke-width="1.5"/></svg>
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500">${item.file.name}</span>
          <span style="font-size:12px;color:var(--color-muted);flex-shrink:0">${item.pageCount ? item.pageCount + ' pages' : ''} • ${formatBytes(item.file.size)}</span>
        </span>
        <button class="btn-remove" data-idx="${idx}" aria-label="Remove ${item.file.name}">×</button>
      `;

      // Drag reorder
      li.addEventListener('dragstart', e => {
        dragSrc = li;
        e.dataTransfer.effectAllowed = 'move';
        li.style.opacity = '0.5';
      });
      li.addEventListener('dragend', () => { li.style.opacity = ''; dragSrc = null; });
      li.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
      li.addEventListener('drop', e => {
        e.preventDefault();
        if (dragSrc === li) return;
        const fromIdx = parseInt(dragSrc.dataset.idx);
        const toIdx   = parseInt(li.dataset.idx);
        const moved   = pdfFiles.splice(fromIdx, 1)[0];
        pdfFiles.splice(toIdx, 0, moved);
        renderList();
        updateStats();
      });

      li.querySelector('.btn-remove').addEventListener('click', () => {
        pdfFiles.splice(idx, 1);
        if (!pdfFiles.length) fileListSec.style.display = 'none';
        else { renderList(); updateStats(); }
      });

      fileListEl.appendChild(li);
    });
  }

  async function loadFiles(files) {
    const arr = Array.from(files).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!arr.length) { showToast('Please upload PDF files only.', 'warning'); return; }

    showToast(`Loading ${arr.length} file(s)...`, 'info');

    for (const file of arr) {
      const bytes = await file.arrayBuffer();
      let pageCount = 0;
      try {
        const pdf = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
        pageCount = pdf.getPageCount();
      } catch(e) { pageCount = 0; }
      pdfFiles.push({ file, bytes, pageCount });
    }

    fileListSec.style.display = '';
    renderList();
    updateStats();
    showToast(`${arr.length} file(s) added.`, 'success');
  }

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
  btnAddMore.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { loadFiles(fileInput.files); fileInput.value = ''; });
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.classList.remove('dragover');
    loadFiles(e.dataTransfer.files);
  });

  btnClear.addEventListener('click', () => {
    pdfFiles = [];
    fileListSec.style.display = 'none';
    progressWrap.style.display = 'none';
  });

  btnMerge.addEventListener('click', async () => {
    if (pdfFiles.length < 2) { showToast('Add at least 2 PDF files to merge.', 'warning'); return; }

    btnMerge.disabled = true;
    progressWrap.style.display = '';
    progressBar.style.width = '0%';
    statusText.textContent = 'Initializing...';

    try {
      const merged = await PDFLib.PDFDocument.create();

      for (let i = 0; i < pdfFiles.length; i++) {
        const pct = Math.round((i / pdfFiles.length) * 85);
        progressBar.style.width = pct + '%';
        statusText.textContent = `Merging "${pdfFiles[i].file.name}" (${i+1}/${pdfFiles.length})...`;

        const doc = await PDFLib.PDFDocument.load(pdfFiles[i].bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach(p => merged.addPage(p));
      }

      progressBar.style.width = '95%';
      statusText.textContent = 'Finalizing PDF...';

      // Metadata
      merged.setTitle(outputName.value || 'merged');
      merged.setCreator('ToolWools PDF Merger');
      merged.setProducer('ToolWools (toolwools.com)');
      merged.setCreationDate(new Date());

      const bytes = await merged.save();
      const blob  = new Blob([bytes], { type: 'application/pdf' });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement('a');
      a.href = url;
      a.download = `${(outputName.value || 'merged').replace(/\.pdf$/i,'')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      progressBar.style.width = '100%';
      statusText.textContent = `✓ Merged ${pdfFiles.length} files (${formatBytes(bytes.length)})`;
      showToast('PDF merged and downloaded!', 'success');
    } catch(err) {
      statusText.textContent = 'Error: ' + err.message;
      showToast('Merge failed: ' + err.message, 'error');
    } finally {
      btnMerge.disabled = false;
      setTimeout(() => { progressBar.style.width = '0%'; }, 3000);
    }
  });
});
