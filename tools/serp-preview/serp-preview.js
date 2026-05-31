/* SERP Preview JS — Phase 5 */
document.addEventListener('DOMContentLoaded', () => {
  const titleInput = document.getElementById('title-input');
  const urlInput   = document.getElementById('url-input');
  const descInput  = document.getElementById('desc-input');
  const dateInput  = document.getElementById('date-input');

  // Google character limits
  const TITLE_MAX    = 60;
  const TITLE_WARN   = 50;
  const DESC_MAX     = 160;
  const DESC_WARN    = 130;

  function formatUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname !== '/' ? u.pathname : '');
    } catch { return url; }
  }

  function update() {
    const title = titleInput.value;
    const url   = urlInput.value;
    const desc  = descInput.value;

    // Desktop preview
    document.getElementById('serp-title').textContent = title || 'Page Title';
    document.getElementById('serp-url').textContent   = formatUrl(url);
    document.getElementById('serp-desc').textContent  = desc || 'Meta description...';

    // Mobile preview
    document.getElementById('serp-title-m').textContent = title.slice(0, 65) || 'Page Title';
    document.getElementById('serp-url-m').textContent   = formatUrl(url);
    document.getElementById('serp-desc-m').textContent  = desc.slice(0, 120) || 'Meta description...';

    // Character badges
    const titleBadge = document.getElementById('title-char-badge');
    titleBadge.textContent = `${title.length}/${TITLE_MAX}`;
    titleBadge.className = 'serp-char-count ' + (title.length > TITLE_MAX ? 'over' : title.length > TITLE_WARN ? 'warn' : 'ok');

    const descBadge = document.getElementById('desc-char-badge');
    descBadge.textContent = `${desc.length}/${DESC_MAX}`;
    descBadge.className = 'serp-char-count ' + (desc.length > DESC_MAX ? 'over' : desc.length > DESC_WARN ? 'warn' : 'ok');

    // SEO Checks
    const checks = [
      { id: 'c1', label: 'Title length (30–60 chars)', pass: title.length >= 30 && title.length <= TITLE_MAX, warn: title.length > 0 && (title.length < 30 || title.length > TITLE_WARN), desc: `Your title is ${title.length} characters. Recommended: 30–60.` },
      { id: 'c2', label: 'Meta description (120–160 chars)', pass: desc.length >= 120 && desc.length <= DESC_MAX, warn: desc.length > 0 && desc.length < 120, desc: `Your description is ${desc.length} characters. Recommended: 120–160.` },
      { id: 'c3', label: 'Title is unique & descriptive', pass: title.length >= 20 && !/(untitled|page|home)/i.test(title), warn: false, desc: 'Avoid generic words like "Home", "Page", or "Untitled".' },
      { id: 'c4', label: 'URL uses HTTPS', pass: url.startsWith('https://'), warn: url.startsWith('http://'), desc: 'Always use HTTPS for security and SEO.' },
      { id: 'c5', label: 'URL contains no spaces or special chars', pass: !/[\s@!#$%^&*()+=[\]{}|\\<>]/.test(url), warn: false, desc: 'Keep URLs clean with lowercase letters, numbers, and hyphens.' },
      { id: 'c6', label: 'Description includes a call to action', pass: /(free|try|get|learn|discover|explore|start|now|today)/i.test(desc), warn: false, desc: 'Add action words to improve click-through rate.' },
    ];

    const list = document.getElementById('checks-list');
    list.innerHTML = checks.map(c => {
      const state = c.pass ? 'pass' : (c.warn ? 'warn' : 'fail');
      const icon  = c.pass ? '✓' : (c.warn ? '!' : '✗');
      return `<div class="checklist-item ${state}"><div class="checklist-icon ${state}">${icon}</div><div class="checklist-content"><div class="checklist-title">${c.label}</div><div class="checklist-desc">${c.desc}</div></div></div>`;
    }).join('');

    // Generate meta HTML
    const metaHTML = `<meta name="title" content="${title}">
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">`;
    document.getElementById('meta-output').value = metaHTML;
  }

  [titleInput, urlInput, descInput].forEach(el => el.addEventListener('input', update));

  document.getElementById('btn-copy-meta').addEventListener('click', () => {
    const out = document.getElementById('meta-output').value;
    navigator.clipboard.writeText(out).then(() => showToast('Meta tags HTML copied!', 'success'));
  });

  document.getElementById('btn-copy-og').addEventListener('click', () => {
    const title = titleInput.value;
    const url   = urlInput.value;
    const desc  = descInput.value;
    const og = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${url}/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">`;
    navigator.clipboard.writeText(og).then(() => showToast('OG tags copied!', 'success'));
  });

  update();
});
