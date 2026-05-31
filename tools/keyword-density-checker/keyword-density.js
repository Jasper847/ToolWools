document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const btnAnalyze = document.getElementById('btn-analyze');
  const table = document.getElementById('density-table');
  const tbody = document.getElementById('density-body');

  const STOP_WORDS = new Set('a an the is it in on at to for of and or but not this that with from by as are was were be been have has had do does did will would shall should may might can could'.split(' '));

  btnAnalyze.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) { showToast('Enter some text to analyze.', 'warning'); return; }

    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
    if (words.length === 0) { showToast('Not enough meaningful words to analyze.', 'info'); return; }

    const freq = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30);
    const total = words.length;

    tbody.innerHTML = sorted.map(([word, count]) => {
      const pct = ((count / total) * 100).toFixed(2);
      return `<tr><td>${word}</td><td>${count}</td><td>${pct}%</td></tr>`;
    }).join('');

    table.style.display = 'table';
    showToast(`Analyzed ${total} words, showing top ${sorted.length} keywords.`, 'success');
  });
});
