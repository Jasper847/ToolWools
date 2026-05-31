document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <div class="tool-controls-row" style="flex-direction:column;gap:12px;align-items:stretch">
      <label for="page-title">Page Title: <input type="text" id="page-title" class="tool-input" placeholder="e.g. 10 Best Project Management Tools for Remote Teams in 2026" style="width:100%"></label>
      <label for="keyword">Target Keyword: <input type="text" id="keyword" class="tool-input" placeholder="e.g. project management tools" style="width:100%"></label>
      <label for="content">Page Content (optional — for smarter extraction): <textarea id="content" class="tool-textarea" rows="5" placeholder="Paste a summary or key points from your page..."></textarea></label>
    </div>
    <div class="tool-controls-row">
      <label>Tone: <select id="tone" class="tool-select">
        <option value="professional">Professional</option>
        <option value="friendly">Friendly</option>
        <option value="urgent">Urgent/FOMO</option>
        <option value="informative">Informative</option>
      </select></label>
      <label>Variations: <input type="number" id="variations" class="tool-input-sm" value="5" min="1" max="10"></label>
    </div>
    <div class="tool-bottom-actions">
      <button id="btn-generate" class="btn btn-primary">Generate Meta Descriptions</button>
    </div>
    <div id="results" style="margin-top:16px"></div>`;

  const TEMPLATES = {
    professional: [
      '{keyword} — {title_fragment}. Learn proven strategies and expert insights. {cta}',
      'Discover the best {keyword} in {year}. {title_fragment}. {cta}',
      '{title_fragment}. Expert guide to {keyword} with actionable tips. {cta}',
      'Looking for {keyword}? {title_fragment}. Compare top options and decide. {cta}',
      'Master {keyword} with our comprehensive guide. {title_fragment}. {cta}'
    ],
    friendly: [
      'Hey! Looking for {keyword}? {title_fragment}. We break it all down for you! {cta}',
      '{title_fragment} — your go-to guide for {keyword}. Easy to follow! {cta}',
      'Find the perfect {keyword} for your needs. {title_fragment}. {cta}',
      'We tested {keyword} so you don\'t have to. {title_fragment}. {cta}',
      '{keyword} made simple. {title_fragment}. No fluff, just answers. {cta}'
    ],
    urgent: [
      'Don\'t choose the wrong {keyword}! {title_fragment}. Read before you decide. {cta}',
      '{year}\'s top {keyword} revealed. {title_fragment}. Don\'t miss out. {cta}',
      'Stop wasting time on bad {keyword}. {title_fragment}. {cta}',
      'The {keyword} landscape has changed. {title_fragment}. Stay ahead. {cta}',
      'Limited guide: {title_fragment}. Get the best {keyword} now. {cta}'
    ],
    informative: [
      'Complete {year} guide to {keyword}. {title_fragment}. Data-backed analysis. {cta}',
      'What are the best {keyword}? {title_fragment}. Detailed comparison inside. {cta}',
      '{title_fragment}. In-depth review of {keyword} with pros, cons, and pricing. {cta}',
      'Everything you need to know about {keyword}. {title_fragment}. {cta}',
      '{keyword}: {title_fragment}. Features, pricing, and honest reviews. {cta}'
    ]
  };

  const CTAS = ['Read more →', 'Learn more here.', 'Check it out!', 'Start now.', 'See the full list.', 'Get started free.', 'Compare options.', 'Find out why.'];

  function generateDescriptions() {
    const title = document.getElementById('page-title').value.trim();
    const keyword = document.getElementById('keyword').value.trim();
    if (!title || !keyword) { showToast('Enter both a page title and target keyword.', 'warning'); return; }

    const tone = document.getElementById('tone').value;
    const count = parseInt(document.getElementById('variations').value) || 5;
    const year = new Date().getFullYear();

    // Extract a fragment from title (remove common prefixes like numbers)
    const titleFragment = title.replace(/^\d+\s+(best|top|most|essential|ultimate)\s+/i, '').substring(0, 60);

    const templates = TEMPLATES[tone] || TEMPLATES.professional;
    const results = [];

    for (let i = 0; i < count; i++) {
      let tpl = templates[i % templates.length];
      let desc = tpl
        .replace(/\{keyword\}/g, keyword)
        .replace(/\{title_fragment\}/g, titleFragment)
        .replace(/\{year\}/g, year)
        .replace(/\{cta\}/g, CTAS[Math.floor(Math.random() * CTAS.length)]);

      // Enforce 155 char limit
      if (desc.length > 155) desc = desc.substring(0, 152) + '...';
      results.push(desc);
    }

    // Render
    let html = '';
    results.forEach((desc, i) => {
      const charCount = desc.length;
      const status = charCount <= 155 ? '✅' : '⚠️';
      html += `<div style="padding:16px;margin-bottom:12px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:700;font-size:13px;color:var(--color-muted)">Variation ${i + 1} ${status}</span>
          <span style="font-size:12px;color:${charCount <= 155 ? 'var(--color-green,#10B981)' : 'var(--color-red,#EF4444)'}">${charCount}/155 chars</span>
        </div>
        <p style="margin:0;font-size:15px;line-height:1.6;color:var(--color-dark)">${desc}</p>
        <button onclick="navigator.clipboard.writeText(this.parentElement.querySelector('p').textContent).then(()=>showToast('Copied!','success'))" style="margin-top:8px;padding:4px 12px;font-size:12px;border:1px solid var(--color-border);border-radius:6px;background:var(--color-bg);color:var(--color-muted);cursor:pointer">Copy</button>
      </div>`;
    });
    document.getElementById('results').innerHTML = html;
    showToast(`${results.length} meta descriptions generated!`, 'success');
  }

  document.getElementById('btn-generate').addEventListener('click', generateDescriptions);
});
