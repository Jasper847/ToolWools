document.addEventListener('DOMContentLoaded', () => {
  const pattern = document.getElementById('pattern');
  const flags = document.getElementById('flags');
  const testString = document.getElementById('test-string');
  const matchInfo = document.getElementById('match-info');
  const highlighted = document.getElementById('highlighted');
  const groups = document.getElementById('groups');

  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function run() {
    const p = pattern.value;
    const f = flags.value;
    const text = testString.value;
    if (!p || !text) { highlighted.innerHTML = escHtml(text); matchInfo.textContent = '0 matches'; groups.innerHTML = ''; return; }

    let regex;
    try { regex = new RegExp(p, f); } catch (e) {
      matchInfo.textContent = 'Invalid regex';
      highlighted.innerHTML = escHtml(text);
      groups.innerHTML = '';
      return;
    }

    const matches = [];
    let m;
    // Ensure global flag for iteration
    const iterRegex = new RegExp(p, f.includes('g') ? f : f + 'g');
    while ((m = iterRegex.exec(text)) !== null) {
      matches.push({index: m.index, length: m[0].length, groups: m.slice(1)});
      if (m[0].length === 0) iterRegex.lastIndex++;
    }

    matchInfo.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '');

    // Build highlighted output
    let html = '';
    let last = 0;
    matches.forEach(mt => {
      html += escHtml(text.slice(last, mt.index));
      html += '<span class="match-hl">' + escHtml(text.slice(mt.index, mt.index + mt.length)) + '</span>';
      last = mt.index + mt.length;
    });
    html += escHtml(text.slice(last));
    highlighted.innerHTML = html;

    // Show capture groups for first match
    if (matches.length > 0 && matches[0].groups.length > 0) {
      groups.innerHTML = '<strong>Capture groups (first match):</strong> ' + matches[0].groups.map((g, i) => `Group ${i+1}: <code>${escHtml(g || '')}</code>`).join(', ');
    } else { groups.innerHTML = ''; }
  }

  [pattern, flags, testString].forEach(el => el.addEventListener('input', run));
  run();
});
