document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const ids = ['s-chars','s-chars-ns','s-letters','s-digits','s-special','s-spaces','s-lines','s-words','s-unique'];
  const els = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));

  function analyze() {
    const t = input.value;
    els['s-chars'].textContent = t.length;
    els['s-chars-ns'].textContent = t.replace(/\s/g, '').length;
    els['s-letters'].textContent = (t.match(/[a-zA-Z]/g) || []).length;
    els['s-digits'].textContent = (t.match(/\d/g) || []).length;
    els['s-special'].textContent = (t.match(/[^a-zA-Z0-9\s]/g) || []).length;
    els['s-spaces'].textContent = (t.match(/ /g) || []).length;
    els['s-lines'].textContent = t === '' ? 0 : t.split('\n').length;
    const words = t.trim().split(/\s+/).filter(w => w.length > 0);
    els['s-words'].textContent = words.length;
    els['s-unique'].textContent = new Set(words.map(w => w.toLowerCase())).size;
  }

  input.addEventListener('input', analyze);
  analyze();

  // Copy & Clear Action Buttons
  const btnCopy = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');
  const copyToast = document.getElementById('copy-toast');

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (!input.value) return;
      navigator.clipboard.writeText(input.value).then(() => {
        if (copyToast) {
          copyToast.classList.add('show');
          setTimeout(() => copyToast.classList.remove('show'), 2000);
        }
      });
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      input.value = '';
      analyze();
    });
  }
});

