document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <label for="topic" class="sr-only">Topic or keywords</label>
    <input type="text" id="topic" class="tool-input" placeholder="Enter your topic, niche, or keywords..." style="width:100%;padding:16px;font-size:16px;margin-bottom:16px">
    <div class="tool-controls-row">
      <label>Platform: <select id="platform" class="tool-select">
        <option value="instagram">Instagram</option>
        <option value="twitter">Twitter/X</option>
        <option value="linkedin">LinkedIn</option>
        <option value="tiktok">TikTok</option>
        <option value="general">General</option>
      </select></label>
      <label>Count: <input type="number" id="count" class="tool-input-sm" value="25" min="5" max="50"></label>
      <label>Style: <select id="style" class="tool-select">
        <option value="mixed">Mixed (Popular + Niche)</option>
        <option value="popular">High Volume Only</option>
        <option value="niche">Niche/Long-tail Only</option>
      </select></label>
    </div>
    <div class="tool-bottom-actions">
      <button id="btn-generate" class="btn btn-primary">Generate Hashtags</button>
      <button id="btn-copy" class="btn btn-secondary">Copy All</button>
      <button id="btn-refresh" class="btn btn-secondary">🔄 Shuffle</button>
    </div>
    <div id="hashtag-output" style="margin-top:16px;padding:20px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-card,16px);min-height:100px;line-height:2.2;font-size:15px"></div>
    <div id="stats" class="tool-badge" style="margin-top:12px"></div>`;

  // Hashtag generation patterns
  const PATTERNS = {
    instagram: {prefixes:['insta','ig','daily','my'],suffixes:['gram','life','vibes','mood','goals','inspo','community','lover','style','world'],popular:['photooftheday','instagood','love','beautiful','follow','picoftheday','instadaily','instalike','explore','trending']},
    twitter: {prefixes:[''],suffixes:['twitter','chat','community','news','tips','thread'],popular:['trending','viral','breakingnews','tech','startup','growthhacking','marketing','innovation']},
    linkedin: {prefixes:[''],suffixes:['tips','strategy','leadership','growth','career','mindset','networking','insights'],popular:['leadership','innovation','personalbrand','careertips','networking','motivation','entrepreneurship','business']},
    tiktok: {prefixes:[''],suffixes:['tok','viral','trend','challenge','hack','tips','fyp'],popular:['fyp','foryou','viral','trending','foryoupage','tiktok','trend','challenge','duet','stitch']},
    general: {prefixes:[''],suffixes:['tips','hacks','life','daily','world','community','lover','goals'],popular:['trending','viral','explore','community','inspiration','motivation','lifestyle','creative']}
  };

  function generateHashtags() {
    const topic = document.getElementById('topic').value.trim();
    if (!topic) { showToast('Enter a topic or keywords first.', 'warning'); return; }
    const platform = document.getElementById('platform').value;
    const count = parseInt(document.getElementById('count').value) || 25;
    const style = document.getElementById('style').value;
    const config = PATTERNS[platform] || PATTERNS.general;

    const words = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);
    const tags = new Set();

    // Direct keyword hashtags
    words.forEach(w => tags.add('#' + w));
    // Combined keywords
    if (words.length >= 2) {
      for (let i = 0; i < words.length - 1; i++) tags.add('#' + words[i] + words[i + 1]);
    }
    // With suffixes
    words.forEach(w => { config.suffixes.forEach(s => tags.add('#' + w + s)); });
    // With prefixes
    words.forEach(w => { config.prefixes.filter(p => p).forEach(p => tags.add('#' + p + w)); });
    // Popular platform tags (if mixed or popular style)
    if (style !== 'niche') config.popular.forEach(t => tags.add('#' + t));
    // Niche variations
    if (style !== 'popular') {
      words.forEach(w => {
        tags.add('#' + w + 'tips');
        tags.add('#' + w + '2026');
        tags.add('#best' + w);
        tags.add('#' + w + 'community');
      });
    }

    // Shuffle and limit
    let result = Array.from(tags).sort(() => Math.random() - 0.5).slice(0, count);

    document.getElementById('hashtag-output').innerHTML = result.map(t =>
      `<span style="display:inline-block;margin:3px 6px;padding:4px 12px;background:var(--color-primary-bg);border-radius:20px;font-weight:500;color:var(--color-primary);cursor:pointer" onclick="navigator.clipboard.writeText('${t}').then(()=>showToast('${t} copied!','success'))">${t}</span>`
    ).join('');
    document.getElementById('stats').textContent = `${result.length} hashtags generated for ${platform.charAt(0).toUpperCase() + platform.slice(1)}`;
    showToast(`${result.length} hashtags generated!`, 'success');
  }

  document.getElementById('btn-generate').addEventListener('click', generateHashtags);
  document.getElementById('btn-refresh').addEventListener('click', generateHashtags);
  document.getElementById('btn-copy').addEventListener('click', () => {
    const tags = document.getElementById('hashtag-output').textContent.trim();
    if (!tags) return;
    navigator.clipboard.writeText(tags).then(() => showToast('All hashtags copied!', 'success'));
  });
  document.getElementById('topic').addEventListener('keydown', e => { if (e.key === 'Enter') generateHashtags(); });
});
