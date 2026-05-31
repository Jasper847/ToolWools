document.addEventListener('DOMContentLoaded', () => {
  const input  = document.getElementById('input');
  const output = document.getElementById('output');

  function process() {
    const ignoreCase  = document.getElementById('opt-ignore-case').checked;
    const trim        = document.getElementById('opt-trim').checked;
    const sort        = document.getElementById('opt-sort').checked;
    const removeBlank = document.getElementById('opt-remove-blank').checked;
    const reverse     = document.getElementById('opt-reverse').checked;

    let lines = input.value.split('\n');
    const totalIn = lines.length;

    if (trim) lines = lines.map(l => l.trim());
    if (removeBlank) lines = lines.filter(l => l !== '');

    const seen = new Set();
    let dupes = 0;
    const unique = [];
    lines.forEach(line => {
      const key = ignoreCase ? line.toLowerCase() : line;
      if (seen.has(key)) { dupes++; }
      else { seen.add(key); unique.push(line); }
    });

    let result = [...unique];
    if (sort) result.sort((a, b) => a.localeCompare(b));
    if (reverse) result.reverse();

    output.value = result.join('\n');
    document.getElementById('stat-in').textContent      = totalIn;
    document.getElementById('stat-out').textContent     = result.length;
    document.getElementById('stat-removed').textContent = totalIn - result.length;
    document.getElementById('stat-dupes').textContent   = dupes;
  }

  document.getElementById('btn-process').addEventListener('click', () => {
    if (!input.value.trim()) { showToast('Enter some text first.', 'warning'); return; }
    process();
    showToast(`Removed ${parseInt(document.getElementById('stat-removed').textContent)} duplicate lines!`, 'success');
  });

  document.getElementById('btn-copy').addEventListener('click', () => {
    if (!output.value) { showToast('Nothing to copy yet.', 'warning'); return; }
    navigator.clipboard.writeText(output.value).then(() => showToast('Copied!', 'success'));
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    input.value = output.value = '';
    ['stat-in','stat-out','stat-removed','stat-dupes'].forEach(id => document.getElementById(id).textContent = '0');
  });

  document.getElementById('btn-swap').addEventListener('click', () => {
    if (!output.value) return;
    input.value = output.value;
    output.value = '';
  });

  // Live stats on type
  input.addEventListener('input', () => {
    const lines = input.value.split('\n');
    document.getElementById('stat-in').textContent = lines.length;
  });
});
