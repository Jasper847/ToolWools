document.addEventListener('DOMContentLoaded', () => {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const controls = document.getElementById('controls');
  const pageInfo = document.getElementById('page-info');
  const scaleSlider = document.getElementById('scale');
  const scaleVal = document.getElementById('scale-val');
  const btnConvert = document.getElementById('btn-convert');
  const output = document.getElementById('output');

  const pdfjsLib = window.pdfjsLib;
  if (pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

  let pdfData = null;

  scaleSlider.addEventListener('input', () => { scaleVal.textContent = scaleSlider.value; });

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); loadFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });

  async function loadFile(file) {
    if (!file || file.type !== 'application/pdf') { showToast('Please select a PDF file.', 'error'); return; }
    pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    pageInfo.textContent = `${pdf.numPages} page(s) ready to convert`;
    controls.style.display = 'block';
    output.innerHTML = '';
  }

  btnConvert.addEventListener('click', async () => {
    if (!pdfData) { showToast('Upload a PDF first.', 'warning'); return; }
    btnConvert.disabled = true;
    output.innerHTML = '';
    const scale = parseFloat(scaleSlider.value);

    try {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Wrap in a card
        const card = document.createElement('div');
        card.style.cssText = 'text-align:center';
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.cssText = 'max-width:200px;border-radius:8px;border:1px solid var(--color-border)';
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.cssText = 'margin-top:8px;font-size:12px';
        btn.textContent = `Download Page ${i}`;
        btn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = `page_${i}.png`;
          a.click();
        });
        card.appendChild(img);
        card.appendChild(document.createElement('br'));
        card.appendChild(btn);
        output.appendChild(card);
      }
      showToast(`${pdf.numPages} page(s) converted to PNG.`, 'success');
    } catch (err) { showToast('Conversion failed: ' + err.message, 'error'); }
    finally { btnConvert.disabled = false; }
  });
});
