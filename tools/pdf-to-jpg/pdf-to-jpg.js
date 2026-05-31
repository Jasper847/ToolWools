document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <div class="upload-zone" id="upload-zone">
      <p style="font-size:16px;font-weight:600;margin-bottom:8px">📄 Drop a PDF file here or click to browse</p>
      <p style="font-size:14px">Converts each page to a JPEG image — client-side, private, no upload</p>
      <input type="file" id="file-input" accept="application/pdf" hidden>
    </div>
    <div id="controls" style="display:none">
      <div class="tool-controls-row">
        <span id="page-info" class="tool-badge"></span>
        <label>Quality: <input type="range" id="quality" min="10" max="100" step="5" value="85" class="tool-range"> <span id="quality-val">85%</span></label>
        <label>Scale: <select id="scale" class="tool-select"><option value="1">1x (Fast)</option><option value="1.5">1.5x</option><option value="2" selected>2x (HD)</option><option value="3">3x (Ultra)</option></select></label>
      </div>
      <div class="tool-bottom-actions">
        <button id="btn-convert" class="btn btn-primary">Convert to JPG</button>
        <button id="btn-download-all" class="btn btn-secondary" disabled>Download All as ZIP</button>
      </div>
    </div>
    <div id="progress" class="tool-badge" style="margin-top:12px;display:none"></div>
    <div id="output" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;margin-top:20px"></div>`;

  const pdfjsLib = window.pdfjsLib;
  if (pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const controls = document.getElementById('controls');
  const qualitySlider = document.getElementById('quality');
  const qualityVal = document.getElementById('quality-val');
  const pageInfo = document.getElementById('page-info');
  const scaleSelect = document.getElementById('scale');
  const btnConvert = document.getElementById('btn-convert');
  const btnDownloadAll = document.getElementById('btn-download-all');
  const progress = document.getElementById('progress');
  const output = document.getElementById('output');

  let pdfData = null;
  let jpegBlobs = [];

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); loadFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });
  qualitySlider.addEventListener('input', () => { qualityVal.textContent = qualitySlider.value + '%'; });

  async function loadFile(file) {
    if (!file || file.type !== 'application/pdf') { showToast('Please select a PDF file.', 'error'); return; }
    pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    pageInfo.textContent = `${pdf.numPages} page(s) ready`;
    controls.style.display = 'block';
    output.innerHTML = '';
    jpegBlobs = [];
    btnDownloadAll.disabled = true;
    showToast(`PDF loaded: ${pdf.numPages} pages.`, 'success');
  }

  btnConvert.addEventListener('click', async () => {
    if (!pdfData) { showToast('Upload a PDF first.', 'warning'); return; }
    btnConvert.disabled = true;
    output.innerHTML = '';
    jpegBlobs = [];
    progress.style.display = 'inline-block';

    const scale = parseFloat(scaleSelect.value);
    const quality = parseInt(qualitySlider.value) / 100;

    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        progress.textContent = `Converting page ${i}/${pdf.numPages}...`;
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        // Convert to JPEG blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
        jpegBlobs.push({ blob, name: `page_${i}.jpg` });

        // Display thumbnail
        const card = document.createElement('div');
        card.style.cssText = 'text-align:center;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:12px;';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.style.cssText = 'width:100%;border-radius:8px;margin-bottom:8px';
        img.alt = `Page ${i}`;
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.cssText = 'font-size:12px;padding:6px 12px;width:100%';
        btn.textContent = `Download Page ${i}`;
        btn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `page_${i}.jpg`;
          a.click();
        });
        card.appendChild(img);
        card.appendChild(btn);
        output.appendChild(card);
      }

      progress.textContent = `✅ ${pdf.numPages} pages converted to JPEG (${qualitySlider.value}% quality)`;
      btnDownloadAll.disabled = false;
      showToast(`${pdf.numPages} pages converted to JPG!`, 'success');
    } catch (err) {
      showToast('Conversion failed: ' + err.message, 'error');
      progress.textContent = 'Error during conversion.';
    } finally { btnConvert.disabled = false; }
  });

  btnDownloadAll.addEventListener('click', async () => {
    if (!jpegBlobs.length) return;
    if (typeof JSZip === 'undefined') {
      // Download individually if no JSZip
      jpegBlobs.forEach(({ blob, name }) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
      });
      showToast('Downloaded all pages individually.', 'success');
      return;
    }
    const zip = new JSZip();
    jpegBlobs.forEach(({ blob, name }) => zip.file(name, blob));
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'pdf-pages-jpg.zip';
    a.click();
    showToast('All pages downloaded as ZIP!', 'success');
  });
});
