document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <label for="input" class="sr-only">Text to analyze</label>
    <textarea id="input" class="tool-textarea" rows="10" placeholder="Paste an article, blog post, or any content here...&#10;&#10;The TF-IDF algorithm will extract statistically important keywords."></textarea>
    <div class="tool-controls-row">
      <label>Top keywords: <input type="number" id="top-n" class="tool-input-sm" value="20" min="5" max="50"></label>
      <label>Min word length: <input type="number" id="min-len" class="tool-input-sm" value="3" min="2" max="8"></label>
      <label><input type="checkbox" id="bigrams" checked> Include 2-word phrases</label>
    </div>
    <div class="tool-bottom-actions">
      <button id="btn-extract" class="btn btn-primary">Extract Keywords</button>
      <button id="btn-copy" class="btn btn-secondary">Copy Keywords</button>
    </div>
    <div id="results" style="margin-top:16px"></div>
    <div id="stats" class="tool-badge" style="margin-top:12px"></div>`;

  const STOP_WORDS = new Set('i me my myself we our ours ourselves you your yours yourself yourselves he him his himself she her hers herself it its itself they them their theirs themselves what which who whom this that these those am is are was were be been being have has had having do does did doing a an the and but if or because as until while of at by for with about against between through during before after above below to from up down in out on off over under again further then once here there when where why how all both each few more most other some such no nor not only own same so than too very s t can will just don should now d ll m o re ve y ain aren couldn didn doesn hadn hasn haven isn ma mightn mustn needn shan shouldn wasn weren won wouldn'.split(' '));

  document.getElementById('btn-extract').addEventListener('click', extract);
  document.getElementById('btn-copy').addEventListener('click', () => {
    const items = document.querySelectorAll('.kw-item');
    if (!items.length) return;
    const text = Array.from(items).map(el => el.dataset.keyword).join(', ');
    navigator.clipboard.writeText(text).then(() => showToast('Keywords copied!', 'success'));
  });

  function tokenize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= parseInt(document.getElementById('min-len').value) && !STOP_WORDS.has(w));
  }

  function extract() {
    const text = document.getElementById('input').value.trim();
    if (!text || text.split(/\s+/).length < 10) { showToast('Enter at least 10 words for meaningful extraction.', 'warning'); return; }

    const tokens = tokenize(text);
    const topN = parseInt(document.getElementById('top-n').value) || 20;
    const includeBigrams = document.getElementById('bigrams').checked;

    // Term frequency
    const tf = {};
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });

    // Bigrams
    if (includeBigrams) {
      for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = tokens[i] + ' ' + tokens[i + 1];
        tf[bigram] = (tf[bigram] || 0) + 1;
      }
    }

    // Simulated IDF (using word rarity based on English frequency — shorter/common words get lower weight)
    const totalTerms = Object.keys(tf).length;
    const scores = {};
    for (const term in tf) {
      const freq = tf[term];
      if (freq < 2 && term.split(' ').length === 1) continue; // Skip single-occurrence unigrams
      // TF-IDF approximation: frequency * inverse rarity (longer/rarer terms score higher)
      const idf = Math.log(1 + totalTerms / (freq + 1)) * (1 + term.length * 0.1);
      scores[term] = freq * idf;
    }

    // Sort and take top N
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, topN);

    // Render results
    const maxScore = sorted[0] ? sorted[0][1] : 1;
    let html = '<div style="display:flex;flex-wrap:wrap;gap:8px">';
    sorted.forEach(([term, score]) => {
      const pct = Math.round((score / maxScore) * 100);
      const size = 12 + Math.round((score / maxScore) * 8);
      html += `<span class="kw-item" data-keyword="${term}" style="display:inline-block;padding:6px 14px;background:rgba(244,81,30,${0.05 + (pct/100)*0.15});border:1px solid rgba(244,81,30,${0.2 + (pct/100)*0.3});border-radius:20px;font-size:${size}px;font-weight:${pct > 60 ? 700 : 500};color:var(--color-dark);cursor:default" title="Score: ${score.toFixed(1)} | Frequency: ${tf[term]}">${term}</span>`;
    });
    html += '</div>';
    document.getElementById('results').innerHTML = html;
    document.getElementById('stats').textContent = `Analyzed ${tokens.length} tokens → extracted ${sorted.length} keywords`;
    showToast(`Extracted ${sorted.length} keywords!`, 'success');
  }
});
