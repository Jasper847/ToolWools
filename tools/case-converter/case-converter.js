/* Case Converter — Enhanced JS (Phase 5) */
document.addEventListener('DOMContentLoaded', () => {
  const input  = document.getElementById('input');
  const output = document.getElementById('output');
  const btnCopy  = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');
  const btnSwap  = document.getElementById('btn-swap');

  // Stat elements
  const statChars  = document.getElementById('stat-chars');
  const statWords  = document.getElementById('stat-words');
  const statLines  = document.getElementById('stat-lines');
  const statSpaces = document.getElementById('stat-spaces');

  const converters = {
    upper:       t => t.toUpperCase(),
    lower:       t => t.toLowerCase(),
    title:       t => t.toLowerCase().replace(/(?:^|\s|[-/])\S/g, c => c.toUpperCase()),
    sentence:    t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase()),
    camel:       t => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    pascal:      t => t.toLowerCase().replace(/(?:^|[^a-zA-Z0-9]+)(\w)/g, (_, c) => c.toUpperCase()),
    snake:       t => t.replace(/[\s\-\.]+/g, '_').replace(/([A-Z])/g, m => '_'+m).replace(/^_+|_+$/g,'').replace(/_+/g,'_').toLowerCase(),
    kebab:       t => t.replace(/[\s_\.]+/g, '-').replace(/([A-Z])/g, m => '-'+m).replace(/^-+|-+$/g,'').replace(/-+/g,'-').toLowerCase(),
    constant:    t => t.replace(/[\s\-\.]+/g, '_').replace(/([A-Z])/g, m => '_'+m).replace(/^_+|_+$/g,'').replace(/_+/g,'_').toUpperCase(),
    dot:         t => t.toLowerCase().replace(/[\s_\-]+/g, '.'),
    toggle:      t => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
    alternating: t => t.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
  };

  function updateStats(text) {
    const words  = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines  = text ? text.split('\n').length : 0;
    const spaces = (text.match(/ /g) || []).length;
    statChars.textContent  = text.length;
    statWords.textContent  = words;
    statLines.textContent  = lines;
    statSpaces.textContent = spaces;
  }

  input.addEventListener('input', () => updateStats(input.value));
  updateStats('');

  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = input.value;
      if (!text.trim()) { showToast('Please enter some text first.', 'warning'); return; }
      const fn = converters[btn.dataset.case];
      output.value = fn ? fn(text) : text;
      updateStats(text);
      // Active state feedback
      document.querySelectorAll('[data-case]').forEach(b => b.classList.remove('action-btn--active'));
      btn.classList.add('action-btn--active');
      setTimeout(() => btn.classList.remove('action-btn--active'), 1200);
    });
  });

  btnCopy.addEventListener('click', () => {
    if (!output.value) { showToast('Nothing to copy yet.', 'warning'); return; }
    navigator.clipboard.writeText(output.value)
      .then(() => showToast('Copied to clipboard!', 'success'))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = output.value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied!', 'success');
      });
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    output.value = '';
    updateStats('');
  });

  btnSwap.addEventListener('click', () => {
    if (!output.value) return;
    input.value = output.value;
    output.value = '';
    updateStats(input.value);
  });
});
