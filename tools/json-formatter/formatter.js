document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const jsonInput = document.getElementById('json-input');
  const jsonOutput = document.getElementById('json-output');
  const errorBanner = document.getElementById('json-error');
  const errorMessage = document.getElementById('error-message');
  const successBanner = document.getElementById('json-success');
  const treeRoot = document.getElementById('json-tree-root');

  // Tabs
  const previewTabs = document.querySelectorAll('.preview-tab');
  const previewContents = document.querySelectorAll('.preview-content');

  // Code actions buttons
  const btnFormat = document.getElementById('btn-format');
  const btnMinify = document.getElementById('btn-minify');
  const btnValidate = document.getElementById('btn-validate');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');

  const btnCopy = document.getElementById('btn-copy-formatted');
  const btnDownload = document.getElementById('btn-download-formatted');

  const copyToast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');

  // Sample JSON
  const sampleJson = {
    "appName": "ToolWools Platform",
    "version": "2.4.1",
    "status": "operational",
    "server": {
      "region": "us-east-1",
      "load": 0.42,
      "activeConnections": 1840,
      "backupEnabled": true
    },
    "categories": [
      "SEO Tools",
      "Image Tools",
      "PDF Tools",
      "Text Tools",
      "Developer Tools"
    ],
    "recentRequests": [
      {
        "id": "req_841028",
        "tool": "image-compressor",
        "bytesSaved": 482010,
        "durationMs": 340,
        "success": true
      },
      {
        "id": "req_841029",
        "tool": "meta-tag-generator",
        "bytesSaved": null,
        "durationMs": 85,
        "success": true
      }
    ]
  };

  // --- TAB SWITCHING ---
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      previewTabs.forEach(t => t.classList.remove('active'));
      previewContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-target');
      document.getElementById(target).classList.add('active');
    });
  });

  // --- HELPER: Escape HTML ---
  function escapeHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- RECURSIVE HTML TREE VIEW BUILDER ---
  function createTreeHtml(value, key = null) {
    const container = document.createElement('div');
    container.className = 'tree-node';
    
    // Key display
    const keySpan = key !== null ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : '';
    
    // Null value
    if (value === null) {
      container.innerHTML = `${keySpan}<span class="json-null">null</span>`;
      return container;
    }
    
    // Primitive types
    const type = typeof value;
    if (type === 'string') {
      container.innerHTML = `${keySpan}<span class="json-string">"${escapeHtml(value)}"</span>`;
      return container;
    }
    if (type === 'number') {
      container.innerHTML = `${keySpan}<span class="json-number">${value}</span>`;
      return container;
    }
    if (type === 'boolean') {
      container.innerHTML = `${keySpan}<span class="json-boolean">${value}</span>`;
      return container;
    }
    
    // Array type
    if (Array.isArray(value)) {
      const size = value.length;
      const header = document.createElement('div');
      header.className = 'tree-node-header';
      header.innerHTML = `
        <svg class="tree-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        ${keySpan}<span class="json-bracket">[</span><span class="json-size">${size} items</span><span class="json-bracket">]</span>
      `;
      
      const content = document.createElement('div');
      content.className = 'tree-node-collapsible tree-node-content';
      
      value.forEach((item, index) => {
        content.appendChild(createTreeHtml(item, index.toString()));
      });
      
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        header.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
      });
      
      container.appendChild(header);
      container.appendChild(content);
      return container;
    }
    
    // Object type
    if (type === 'object') {
      const keys = Object.keys(value);
      const size = keys.length;
      const header = document.createElement('div');
      header.className = 'tree-node-header';
      header.innerHTML = `
        <svg class="tree-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        ${keySpan}<span class="json-bracket">{</span><span class="json-size">${size} keys</span><span class="json-bracket">}</span>
      `;
      
      const content = document.createElement('div');
      content.className = 'tree-node-collapsible tree-node-content';
      
      keys.forEach(k => {
        content.appendChild(createTreeHtml(value[k], k));
      });
      
      header.addEventListener('click', (e) => {
        e.stopPropagation();
        header.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
      });
      
      container.appendChild(header);
      container.appendChild(content);
      return container;
    }
    
    return container;
  }

  // --- CORE FORMAT & VALIDATE ACTIONS ---
  function parseInput() {
    const rawVal = jsonInput.value.trim();
    if (!rawVal) {
      throw new Error('Input is empty. Please enter some JSON text.');
    }
    return JSON.parse(rawVal);
  }

  function handleFormat() {
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    
    try {
      const obj = parseInput();
      const formatted = JSON.stringify(obj, null, 2);
      jsonOutput.value = formatted;
      
      // Update interactive tree
      treeRoot.innerHTML = '';
      treeRoot.appendChild(createTreeHtml(obj));
      
      successBanner.classList.add('show');
    } catch (err) {
      errorMessage.textContent = err.message;
      errorBanner.classList.add('show');
      jsonOutput.value = '';
      
      // Empty tree view state
      treeRoot.innerHTML = `
        <span class="json-bracket">{</span>
        <div class="tree-node-collapsible">
          <span style="color: var(--color-red);">Error: Invalid JSON layout. Cannot render tree.</span>
        </div>
        <span class="json-bracket">}</span>
      `;
    }
  }

  function handleMinify() {
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    
    try {
      const obj = parseInput();
      const minified = JSON.stringify(obj);
      jsonOutput.value = minified;
      
      treeRoot.innerHTML = '';
      treeRoot.appendChild(createTreeHtml(obj));
      
      successBanner.classList.add('show');
    } catch (err) {
      errorMessage.textContent = err.message;
      errorBanner.classList.add('show');
      jsonOutput.value = '';
    }
  }

  function handleValidateOnly() {
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    
    try {
      const obj = parseInput();
      successBanner.classList.add('show');
      
      treeRoot.innerHTML = '';
      treeRoot.appendChild(createTreeHtml(obj));
    } catch (err) {
      errorMessage.textContent = err.message;
      errorBanner.classList.add('show');
    }
  }

  // --- BUTTON EVENT BINDINGS ---
  btnFormat.addEventListener('click', handleFormat);
  btnMinify.addEventListener('click', handleMinify);
  btnValidate.addEventListener('click', handleValidateOnly);

  btnSample.addEventListener('click', () => {
    jsonInput.value = JSON.stringify(sampleJson, null, 2);
    handleFormat();
  });

  btnClear.addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.value = '';
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    treeRoot.innerHTML = `
      <span class="json-bracket">{</span>
      <div class="tree-node-collapsible">
        <span style="color: var(--color-muted);">No JSON loaded yet. Paste valid JSON on the left panel.</span>
      </div>
      <span class="json-bracket">}</span>
    `;
  });

  // --- COPY & DOWNLOAD ---
  btnCopy.addEventListener('click', () => {
    const text = jsonOutput.value.trim();
    if (!text) return;

    jsonOutput.select();
    navigator.clipboard.writeText(text).then(() => {
      toastMessage.textContent = 'Formatted JSON copied to clipboard!';
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 3000);
    });
  });

  btnDownload.addEventListener('click', () => {
    const text = jsonOutput.value.trim();
    if (!text) return;

    const blob = new Blob([text], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.download = 'toolwools-formatted.json';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.dataset.downloadurl = ['application/json', anchor.download, anchor.href].join(':');
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    toastMessage.textContent = 'JSON file downloaded successfully!';
    copyToast.classList.add('show');
    setTimeout(() => {
      copyToast.classList.remove('show');
    }, 3000);
  });

  // Auto load sample on first launch to show visual power
  jsonInput.value = JSON.stringify(sampleJson, null, 2);
  handleFormat();

  // ==========================================
  // PHASE 2 ADDITIONS: Sort Keys, JSONPath, YAML
  // ==========================================

  // --- SORT KEYS (deep recursive) ---
  function sortObjectKeys(obj) {
    if (Array.isArray(obj)) return obj.map(sortObjectKeys);
    if (obj !== null && typeof obj === 'object') {
      const sorted = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key]);
      });
      return sorted;
    }
    return obj;
  }

  // Create Sort Keys button if not already in DOM
  let btnSort = document.getElementById('btn-sort-keys');
  if (!btnSort) {
    btnSort = document.createElement('button');
    btnSort.id = 'btn-sort-keys';
    btnSort.className = 'action-btn';
    btnSort.textContent = 'Sort Keys';
    btnSort.title = 'Sort all object keys alphabetically (recursive)';
    // Insert after the format button
    if (btnFormat && btnFormat.parentNode) {
      btnFormat.parentNode.insertBefore(btnSort, btnMinify);
    }
  }
  btnSort.addEventListener('click', () => {
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    try {
      const obj = parseInput();
      const sorted = sortObjectKeys(obj);
      const formatted = JSON.stringify(sorted, null, 2);
      jsonInput.value = formatted;
      jsonOutput.value = formatted;
      treeRoot.innerHTML = '';
      treeRoot.appendChild(createTreeHtml(sorted));
      successBanner.classList.add('show');
      showToast('Keys sorted alphabetically (all levels).', 'success');
    } catch (err) {
      errorMessage.textContent = err.message;
      errorBanner.classList.add('show');
    }
  });

  // --- JSONPath QUERY ---
  // Simple JSONPath evaluator (supports dot notation & bracket notation basics)
  function queryJsonPath(obj, path) {
    if (!path || path === '$') return obj;
    // Normalize: remove leading $. or $
    let normalized = path.replace(/^\$\.?/, '');
    if (!normalized) return obj;

    const segments = [];
    // Split on dots and brackets
    normalized.replace(/\[(\d+)\]/g, '.$1').split('.').forEach(seg => {
      if (seg !== '') segments.push(seg);
    });

    let current = obj;
    for (const seg of segments) {
      if (current === null || current === undefined) return undefined;
      if (Array.isArray(current)) {
        const idx = parseInt(seg, 10);
        if (!isNaN(idx)) { current = current[idx]; continue; }
      }
      if (typeof current === 'object') { current = current[seg]; continue; }
      return undefined;
    }
    return current;
  }

  let btnJsonPath = document.getElementById('btn-jsonpath');
  let jsonPathInput = document.getElementById('jsonpath-input');
  if (!btnJsonPath) {
    // Create JSONPath input + button
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap;';
    jsonPathInput = document.createElement('input');
    jsonPathInput.id = 'jsonpath-input';
    jsonPathInput.type = 'text';
    jsonPathInput.placeholder = 'JSONPath query, e.g. $.server.region';
    jsonPathInput.style.cssText = 'flex:1;min-width:180px;padding:8px 12px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-surface);color:var(--color-text);font-size:13px;';
    btnJsonPath = document.createElement('button');
    btnJsonPath.id = 'btn-jsonpath';
    btnJsonPath.className = 'action-btn';
    btnJsonPath.textContent = 'Query';
    btnJsonPath.title = 'Run JSONPath query on the input JSON';
    wrapper.appendChild(jsonPathInput);
    wrapper.appendChild(btnJsonPath);

    // Insert after the action buttons bar
    const actionsBar = btnFormat ? btnFormat.closest('.actions-bar, .code-actions, .toolbar-actions') : null;
    if (actionsBar && actionsBar.parentNode) {
      actionsBar.parentNode.insertBefore(wrapper, actionsBar.nextSibling);
    } else {
      // Fallback: append before the input textarea
      jsonInput.parentNode.insertBefore(wrapper, jsonInput);
    }
  }
  btnJsonPath.addEventListener('click', () => {
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    try {
      const obj = parseInput();
      const path = jsonPathInput.value.trim();
      const result = queryJsonPath(obj, path);
      if (result === undefined) {
        showToast('Path returned no results.', 'warning');
        jsonOutput.value = 'undefined';
      } else {
        const formatted = JSON.stringify(result, null, 2);
        jsonOutput.value = formatted;
        treeRoot.innerHTML = '';
        treeRoot.appendChild(createTreeHtml(result));
        successBanner.classList.add('show');
        showToast('JSONPath query executed.', 'success');
      }
    } catch (err) {
      errorMessage.textContent = err.message;
      errorBanner.classList.add('show');
    }
  });
  // Allow Enter key in path input
  jsonPathInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); btnJsonPath.click(); }
  });

  // --- JSON ↔ YAML CONVERSION ---
  let btnToYaml = document.getElementById('btn-to-yaml');
  let btnFromYaml = document.getElementById('btn-from-yaml');
  if (!btnToYaml) {
    btnToYaml = document.createElement('button');
    btnToYaml.id = 'btn-to-yaml';
    btnToYaml.className = 'action-btn';
    btnToYaml.textContent = 'JSON → YAML';
    btnToYaml.title = 'Convert the current JSON to YAML';
    if (btnDownload && btnDownload.parentNode) {
      btnDownload.parentNode.insertBefore(btnToYaml, btnDownload.nextSibling);
    }
  }
  if (!btnFromYaml) {
    btnFromYaml = document.createElement('button');
    btnFromYaml.id = 'btn-from-yaml';
    btnFromYaml.className = 'action-btn';
    btnFromYaml.textContent = 'YAML → JSON';
    btnFromYaml.title = 'Parse YAML in the input and convert to JSON';
    if (btnToYaml && btnToYaml.parentNode) {
      btnToYaml.parentNode.insertBefore(btnFromYaml, btnToYaml.nextSibling);
    }
  }

  btnToYaml.addEventListener('click', () => {
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    if (typeof jsyaml === 'undefined') {
      showToast('YAML library not loaded. Please refresh the page.', 'error');
      return;
    }
    try {
      const obj = parseInput();
      const yaml = jsyaml.dump(obj, { indent: 2, lineWidth: 120, noRefs: true });
      jsonOutput.value = yaml;
      successBanner.classList.add('show');
      showToast('Converted to YAML.', 'success');
    } catch (err) {
      errorMessage.textContent = err.message;
      errorBanner.classList.add('show');
    }
  });

  btnFromYaml.addEventListener('click', () => {
    errorBanner.classList.remove('show');
    successBanner.classList.remove('show');
    if (typeof jsyaml === 'undefined') {
      showToast('YAML library not loaded. Please refresh the page.', 'error');
      return;
    }
    try {
      const raw = jsonInput.value.trim();
      if (!raw) throw new Error('Input is empty.');
      const obj = jsyaml.load(raw);
      const formatted = JSON.stringify(obj, null, 2);
      jsonInput.value = formatted;
      jsonOutput.value = formatted;
      treeRoot.innerHTML = '';
      treeRoot.appendChild(createTreeHtml(obj));
      successBanner.classList.add('show');
      showToast('YAML parsed and converted to JSON.', 'success');
    } catch (err) {
      errorMessage.textContent = err.message;
      errorBanner.classList.add('show');
    }
  });
});
