document.addEventListener('DOMContentLoaded', () => {
  const textA = document.getElementById('text-a');
  const textB = document.getElementById('text-b');
  const btnCompare = document.getElementById('btn-compare');
  const diffResult = document.getElementById('diff-result');

  // Simple line-by-line diff with LCS-based approach
  function lcs(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
    // Backtrack
    const result = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i-1] === b[j-1]) { result.unshift({type: 'same', value: a[i-1]}); i--; j--; }
      else if (dp[i-1][j] > dp[i][j-1]) { result.unshift({type: 'remove', value: a[i-1]}); i--; }
      else { result.unshift({type: 'add', value: b[j-1]}); j--; }
    }
    while (i > 0) { result.unshift({type: 'remove', value: a[i-1]}); i--; }
    while (j > 0) { result.unshift({type: 'add', value: b[j-1]}); j--; }
    return result;
  }

  btnCompare.addEventListener('click', () => {
    const a = textA.value.split('\n');
    const b = textB.value.split('\n');
    if (!textA.value.trim() && !textB.value.trim()) {
      showToast('Enter text in both panels to compare.', 'warning');
      return;
    }
    const diff = lcs(a, b);
    let html = '';
    diff.forEach(d => {
      const escaped = d.value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      if (d.type === 'same') html += escaped + '\n';
      else if (d.type === 'add') html += `<span class="diff-add">+ ${escaped}</span>\n`;
      else html += `<span class="diff-remove">- ${escaped}</span>\n`;
    });
    diffResult.innerHTML = html || '<em>No differences found.</em>';
    const added = diff.filter(d => d.type === 'add').length;
    const removed = diff.filter(d => d.type === 'remove').length;
    showToast(`Comparison done: ${added} added, ${removed} removed.`, 'info');
  });
});
