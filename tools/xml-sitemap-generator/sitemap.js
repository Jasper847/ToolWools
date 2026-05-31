/* =============================================
   TOOLWOOLS — XML Sitemap Generator (Phase 2)
   - Honest validation (no fake "200 OK" crawl)
   - Real HTML file link extraction via DOMParser
   - Manual URL list input
   - Configurable change frequency, priority, lastmod
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const siteUrlInput = document.getElementById('site-url');
  const changeFreqSelect = document.getElementById('change-freq');
  const lastmodSelect = document.getElementById('lastmod-toggle');
  const prioritySlider = document.getElementById('default-priority');
  const priorityVal = document.getElementById('priority-val');

  // Input tabs & containers
  const tabInputManual = document.getElementById('tab-input-manual');
  const tabInputFiles = document.getElementById('tab-input-files');
  const manualContainer = document.getElementById('method-manual-container');
  const filesContainer = document.getElementById('method-files-container');

  const manualUrlsTextarea = document.getElementById('manual-urls');
  const htmlFilesInput = document.getElementById('html-files-input');
  const htmlDropZone = document.getElementById('html-drop-zone');
  const htmlUploadStatus = document.getElementById('html-upload-status');

  const btnCrawl = document.getElementById('btn-crawl');
  const progressContainer = document.getElementById('progress-container');
  const progressStatus = document.getElementById('progress-status');
  const progressPercentage = document.getElementById('progress-percentage');
  const progressFill = document.getElementById('progress-fill');
  const consoleLog = document.getElementById('console-log');

  const xmlOutput = document.getElementById('xml-output');
  const btnCopyXml = document.getElementById('btn-copy-xml');
  const btnDownloadXml = document.getElementById('btn-download-xml');

  const copyToast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');

  // State
  let activeMethod = 'manual';
  let scannedFiles = [];
  let extractedPaths = [];

  // Update slider label
  prioritySlider.addEventListener('input', (e) => {
    priorityVal.textContent = parseFloat(e.target.value).toFixed(1);
  });

  // --- INPUT METHOD TOGGLE ---
  tabInputManual.addEventListener('click', () => {
    tabInputManual.classList.add('active');
    tabInputFiles.classList.remove('active');
    manualContainer.style.display = 'block';
    filesContainer.style.display = 'none';
    activeMethod = 'manual';
    clearConsole();
    writeConsoleLine('Switched to manual URL list input mode.', 'info');
  });

  tabInputFiles.addEventListener('click', () => {
    tabInputFiles.classList.add('active');
    tabInputManual.classList.remove('active');
    filesContainer.style.display = 'block';
    manualContainer.style.display = 'none';
    activeMethod = 'files';
    clearConsole();
    writeConsoleLine('Switched to HTML file scanning mode. Upload files to extract links.', 'info');
  });

  // --- HTML UPLOAD DRAG/DROP ---
  htmlDropZone.addEventListener('click', () => htmlFilesInput.click());
  htmlDropZone.addEventListener('dragover', (e) => { e.preventDefault(); htmlDropZone.classList.add('dragover'); });
  htmlDropZone.addEventListener('dragleave', () => htmlDropZone.classList.remove('dragover'));
  htmlDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    htmlDropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFilesSelected(e.dataTransfer.files);
  });
  htmlFilesInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFilesSelected(e.target.files);
  });

  function handleFilesSelected(filesList) {
    scannedFiles = Array.from(filesList).filter(f => f.name.endsWith('.html') || f.name.endsWith('.htm'));
    if (scannedFiles.length === 0) {
      showToast('Please upload valid HTML files (.html or .htm).', 'warning');
      htmlUploadStatus.textContent = 'Choose HTML files or drag here';
      return;
    }
    htmlUploadStatus.textContent = `${scannedFiles.length} HTML file(s) loaded`;
    writeConsoleLine(`Loaded ${scannedFiles.length} HTML file(s). Ready to extract links.`, 'success');

    // Extract links from HTML files
    extractLinksFromFiles();
  }

  // --- REAL LINK EXTRACTION from HTML files ---
  async function extractLinksFromFiles() {
    extractedPaths = [];
    const parser = new DOMParser();

    for (const file of scannedFiles) {
      try {
        const text = await file.text();
        const doc = parser.parseFromString(text, 'text/html');
        const anchors = doc.querySelectorAll('a[href]');
        const fileBasePath = file.name === 'index.html' || file.name === 'index.htm' ? '/' : '/' + file.name;

        // Add the file itself as a path
        if (!extractedPaths.includes(fileBasePath)) {
          extractedPaths.push(fileBasePath);
        }

        // Extract relative links
        anchors.forEach(a => {
          let href = a.getAttribute('href');
          if (!href) return;
          // Skip anchors, mailto, tel, javascript, external
          if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
          if (href.startsWith('http://') || href.startsWith('https://')) return; // external
          // Normalize
          if (!href.startsWith('/')) href = '/' + href;
          href = href.split('#')[0].split('?')[0]; // remove hash & query
          if (href && !extractedPaths.includes(href)) {
            extractedPaths.push(href);
          }
        });

        writeConsoleLine(`Parsed "${file.name}" — found ${anchors.length} links.`, 'info');
      } catch (err) {
        writeConsoleLine(`Error reading "${file.name}": ${err.message}`, 'error');
      }
    }

    // Deduplicate
    extractedPaths = [...new Set(extractedPaths)];
    writeConsoleLine(`Total unique paths extracted: ${extractedPaths.length}`, 'success');
  }

  // --- TIMESTAMPS ---
  function getTimestamp() {
    return `[${new Date().toTimeString().split(' ')[0]}]`;
  }

  // --- TERMINAL LOG ---
  function clearConsole() { consoleLog.innerHTML = ''; }

  function writeConsoleLine(message, type = 'info') {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="terminal-time">${getTimestamp()}</span><span class="terminal-msg ${type}">${message}</span>`;
    consoleLog.appendChild(line);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  // --- URL VALIDATION ---
  function isValidUrl(str) {
    try { new URL(str); return true; } catch { return false; }
  }

  function isValidPath(path) {
    // Basic path validation: starts with / and no weird chars
    return /^\/[^\s]*$/.test(path);
  }

  // --- COMPILE XML SITEMAP ---
  function compileSitemap(rootUrl, pathList) {
    const defaultPriority = parseFloat(prioritySlider.value);
    const globalFreq = changeFreqSelect.value;
    const lastmodChoice = lastmodSelect.value;
    const todayStr = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    pathList.forEach(path => {
      let fullUrl = rootUrl;
      if (path !== '/' && path !== '') {
        const sep = (rootUrl.endsWith('/') || path.startsWith('/')) ? '' : '/';
        fullUrl = `${rootUrl}${sep}${path}`;
      } else {
        if (!fullUrl.endsWith('/')) fullUrl += '/';
      }

      // Priority based on depth
      let priority = defaultPriority;
      if (path === '/' || path === '') {
        priority = 1.0;
      } else {
        const depth = (path.match(/\//g) || []).length;
        priority = Math.max(0.1, defaultPriority - (depth * 0.1));
      }

      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(fullUrl)}</loc>\n`;
      if (lastmodChoice === 'custom' || lastmodChoice === 'server') {
        xml += `    <lastmod>${todayStr}</lastmod>\n`;
      }
      xml += `    <changefreq>${globalFreq}</changefreq>\n`;
      xml += `    <priority>${priority.toFixed(1)}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  }

  function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  // --- GENERATE SITEMAP ---
  btnCrawl.addEventListener('click', () => {
    let rootUrl = siteUrlInput.value.trim();
    if (!rootUrl) {
      showToast('Please enter your website root URL.', 'warning');
      return;
    }
    if (!rootUrl.startsWith('http://') && !rootUrl.startsWith('https://')) {
      rootUrl = 'https://' + rootUrl;
      siteUrlInput.value = rootUrl;
    }
    if (!isValidUrl(rootUrl)) {
      showToast('That URL does not look valid. Please check the format.', 'error');
      return;
    }
    if (rootUrl.endsWith('/')) rootUrl = rootUrl.slice(0, -1);

    // Get paths
    let paths = [];
    if (activeMethod === 'manual') {
      const rawText = manualUrlsTextarea.value.trim();
      if (!rawText) {
        showToast('Please enter at least one URL path.', 'warning');
        return;
      }
      paths = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    } else {
      if (extractedPaths.length === 0) {
        showToast('Please upload HTML files to extract links from.', 'warning');
        return;
      }
      paths = [...extractedPaths];
    }

    // Deduplicate
    paths = [...new Set(paths)];

    // Lock UI
    btnCrawl.disabled = true;
    siteUrlInput.disabled = true;
    changeFreqSelect.disabled = true;
    lastmodSelect.disabled = true;
    prioritySlider.disabled = true;
    btnCopyXml.disabled = true;
    btnDownloadXml.disabled = true;
    xmlOutput.value = '';

    progressContainer.classList.add('active');
    progressFill.style.width = '0%';
    progressPercentage.textContent = '0%';
    progressStatus.textContent = 'Validating paths...';
    clearConsole();

    writeConsoleLine(`Sitemap generation started for: ${rootUrl}`, 'info');
    writeConsoleLine(`Processing ${paths.length} unique path(s)...`, 'info');

    // Validate paths with honest progress (no fake HTTP)
    let validPaths = [];
    let invalidCount = 0;
    let idx = 0;

    function processNext() {
      if (idx >= paths.length) {
        // Done
        finishGeneration(rootUrl, validPaths, invalidCount);
        return;
      }

      const p = paths[idx];
      const pct = Math.round(((idx + 1) / paths.length) * 90);
      progressFill.style.width = `${pct}%`;
      progressPercentage.textContent = `${pct}%`;
      progressStatus.textContent = `Validating: ${p}`;

      // Check if it's a valid-looking path
      const normalizedPath = p.startsWith('/') ? p : '/' + p;
      if (isValidPath(normalizedPath)) {
        validPaths.push(normalizedPath);
        writeConsoleLine(`✓ Valid path: ${normalizedPath}`, 'info');
      } else {
        invalidCount++;
        writeConsoleLine(`✗ Invalid path skipped: ${p}`, 'error');
      }

      idx++;
      // Small delay for visual feedback (honest — just UI pacing, not pretending to fetch)
      setTimeout(processNext, Math.max(20, 150 - paths.length * 2));
    }

    setTimeout(processNext, 100);
  });

  function finishGeneration(rootUrl, validPaths, invalidCount) {
    if (validPaths.length === 0) {
      progressFill.style.width = '100%';
      progressPercentage.textContent = '100%';
      progressStatus.textContent = 'No valid paths found.';
      writeConsoleLine('No valid paths to include. Sitemap is empty.', 'error');
      unlockUI();
      return;
    }

    progressFill.style.width = '95%';
    progressPercentage.textContent = '95%';
    progressStatus.textContent = 'Compiling XML...';

    const xml = compileSitemap(rootUrl, validPaths);
    xmlOutput.value = xml;

    progressFill.style.width = '100%';
    progressPercentage.textContent = '100%';
    progressStatus.textContent = 'Sitemap generated!';

    writeConsoleLine(`Sitemap compiled: ${validPaths.length} URLs included.`, 'success');
    if (invalidCount > 0) {
      writeConsoleLine(`${invalidCount} invalid path(s) were skipped.`, 'info');
    }

    btnCopyXml.disabled = false;
    btnDownloadXml.disabled = false;
    unlockUI();
  }

  function unlockUI() {
    btnCrawl.disabled = false;
    siteUrlInput.disabled = false;
    changeFreqSelect.disabled = false;
    lastmodSelect.disabled = false;
    prioritySlider.disabled = false;
  }

  // --- CLIPBOARD & DOWNLOAD ---
  btnCopyXml.addEventListener('click', () => {
    xmlOutput.select();
    navigator.clipboard.writeText(xmlOutput.value).then(() => {
      showToast('XML sitemap copied to clipboard!', 'success');
    });
  });

  btnDownloadXml.addEventListener('click', () => {
    const text = xmlOutput.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'application/xml' });
    const a = document.createElement('a');
    a.download = 'sitemap.xml';
    a.href = URL.createObjectURL(a);
    a.href = URL.createObjectURL(blob);
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('sitemap.xml downloaded!', 'success');
  });
});
