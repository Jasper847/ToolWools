document.addEventListener('DOMContentLoaded', function () {
  const inputEl = document.getElementById('input');
  const btnAnalyze = document.getElementById('btn-analyze');
  const freqGrid = document.getElementById('freq-grid');
  const totalStats = document.getElementById('total-stats');

  btnAnalyze.addEventListener('click', analyze);

  function analyze() {
    const text = inputEl.value;
    if (!text.trim()) {
      showToast('Please enter some text to analyze.', 'error');
      return;
    }

    // Count each letter A-Z (case insensitive)
    const counts = {};
    let totalLetters = 0;
    for (let i = 65; i <= 90; i++) {
      counts[String.fromCharCode(i)] = 0;
    }

    for (let i = 0; i < text.length; i++) {
      const ch = text[i].toUpperCase();
      if (ch >= 'A' && ch <= 'Z') {
        counts[ch]++;
        totalLetters++;
      }
    }

    // Find max count for bar scaling
    let maxCount = 0;
    for (const letter in counts) {
      if (counts[letter] > maxCount) {
        maxCount = counts[letter];
      }
    }

    // Build frequency grid
    freqGrid.innerHTML = '';
    const letters = Object.keys(counts).sort();

    letters.forEach(function (letter) {
      const count = counts[letter];
      const percentage = totalLetters > 0 ? ((count / totalLetters) * 100).toFixed(1) : '0.0';
      const barWidth = maxCount > 0 ? ((count / maxCount) * 100).toFixed(0) : 0;

      const item = document.createElement('div');
      item.className = 'freq-item';
      item.innerHTML =
        '<div class="freq-letter">' + letter + '</div>' +
        '<div class="freq-count">' + count + ' (' + percentage + '%)</div>' +
        '<div class="freq-bar" style="width:' + barWidth + '%"></div>';
      freqGrid.appendChild(item);
    });

    // Show total stats
    const totalChars = text.length;
    const totalWords = text.trim().split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    totalStats.textContent = 'Total letters: ' + totalLetters + ' | Characters: ' + totalChars + ' | Words: ' + totalWords + ' | Unique letters: ' + letters.filter(function (l) { return counts[l] > 0; }).length + '/26';
    totalStats.style.display = 'inline-block';

    showToast('Analysis complete!', 'success');
  }

  // showToast fallback
  function showToast(message, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }
    var toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;color:#fff;font-size:14px;z-index:9999;transition:opacity .3s ease;' +
      (type === 'error' ? 'background:#e53935;' : 'background:#43a047;');
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }
});
