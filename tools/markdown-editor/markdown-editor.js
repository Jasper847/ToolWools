/* Markdown Editor JS — Phase 5 */
document.addEventListener('DOMContentLoaded', () => {
  const mdInput  = document.getElementById('md-input');
  const mdPreview = document.getElementById('md-preview');

  // Configure marked
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: true,
    });
  }

  function renderMarkdown() {
    const md = mdInput.value;
    if (typeof marked !== 'undefined') {
      mdPreview.innerHTML = marked.parse(md);
      // Make links open in new tab
      mdPreview.querySelectorAll('a').forEach(a => {
        if (!a.href.startsWith('#')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      });
      // Checkbox support
      mdPreview.querySelectorAll('li').forEach(li => {
        if (li.textContent.startsWith('[ ] ') || li.textContent.startsWith('[x] ') || li.textContent.startsWith('[X] ')) {
          const checked = li.textContent.startsWith('[x]') || li.textContent.startsWith('[X]');
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = checked;
          cb.style.cssText = 'margin-right:6px;cursor:default';
          cb.disabled = true;
          const text = document.createTextNode(li.textContent.slice(4));
          li.innerHTML = '';
          li.appendChild(cb);
          li.appendChild(text);
        }
      });
    } else {
      // Fallback: basic escaping
      mdPreview.textContent = md;
    }

    // Update stats
    const words = md.trim() ? md.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    document.getElementById('stat-chars').textContent = md.length;
    document.getElementById('stat-words').textContent = words;
    document.getElementById('stat-lines').textContent = md ? md.split('\n').length : 0;
    document.getElementById('stat-read').textContent = readTime + 'm';
  }

  mdInput.addEventListener('input', renderMarkdown);

  // Toolbar
  document.querySelector('.md-toolbar').addEventListener('click', e => {
    const btn = e.target.closest('.md-toolbar-btn');
    if (!btn) return;

    const start = mdInput.selectionStart;
    const end   = mdInput.selectionEnd;
    const sel   = mdInput.value.substring(start, end);
    let newText = mdInput.value;
    let cursor  = start;

    if (btn.dataset.wrap) {
      const before = btn.dataset.wrap.replace(/&#10;/g, '\n');
      const after  = (btn.dataset.wrapEnd || btn.dataset.wrap).replace(/&#10;/g, '\n');
      newText = newText.substring(0, start) + before + sel + after + newText.substring(end);
      cursor = start + before.length + sel.length + after.length;
    } else if (btn.dataset.insert) {
      const ins = btn.dataset.insert.replace(/&#10;/g, '\n');
      newText = newText.substring(0, start) + ins + newText.substring(end);
      cursor = start + ins.length;
    }

    mdInput.value = newText;
    mdInput.setSelectionRange(cursor, cursor);
    mdInput.focus();
    renderMarkdown();
  });

  // Tab key support in textarea
  mdInput.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = mdInput.selectionStart;
      const v = mdInput.value;
      mdInput.value = v.substring(0, s) + '  ' + v.substring(mdInput.selectionEnd);
      mdInput.selectionStart = mdInput.selectionEnd = s + 2;
    }
    // Ctrl+B, Ctrl+I shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        const s = mdInput.selectionStart, en = mdInput.selectionEnd;
        const sel = mdInput.value.substring(s, en);
        mdInput.value = mdInput.value.substring(0,s) + '**' + sel + '**' + mdInput.value.substring(en);
        mdInput.setSelectionRange(s+2, s+2+sel.length);
        renderMarkdown();
      }
      if (e.key === 'i') {
        e.preventDefault();
        const s = mdInput.selectionStart, en = mdInput.selectionEnd;
        const sel = mdInput.value.substring(s, en);
        mdInput.value = mdInput.value.substring(0,s) + '*' + sel + '*' + mdInput.value.substring(en);
        mdInput.setSelectionRange(s+1, s+1+sel.length);
        renderMarkdown();
      }
    }
  });

  document.getElementById('btn-copy-html').addEventListener('click', () => {
    const html = mdPreview.innerHTML;
    navigator.clipboard.writeText(html).then(() => showToast('HTML copied to clipboard!', 'success'));
  });

  document.getElementById('btn-download-md').addEventListener('click', () => {
    const blob = new Blob([mdInput.value], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Markdown file downloaded!', 'success');
  });

  document.getElementById('btn-download-html').addEventListener('click', () => {
    const full = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export — ToolWools</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 24px; color: #374151; line-height: 1.7; }
h1,h2,h3 { color: #111; } code { background:#f3f4f6; border-radius:4px; padding:2px 6px; font-family:monospace; }
pre { background:#1f2937; color:#e5e7eb; border-radius:12px; padding:16px; overflow-x:auto; }
blockquote { border-left:4px solid #F4511E; padding:8px 16px; background:#fff3ee; border-radius:0 8px 8px 0; }
table { border-collapse:collapse; width:100%; } th,td { border:1px solid #e5e7eb; padding:8px 12px; } th { background:#f9fafb; }
</style>
</head>
<body>${mdPreview.innerHTML}</body></html>`;
    const blob = new Blob([full], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('HTML file downloaded!', 'success');
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    mdInput.value = '';
    renderMarkdown();
  });

  // Initial render
  renderMarkdown();
});
