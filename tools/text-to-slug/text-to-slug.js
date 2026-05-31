/* Text to Slug Generator JS */
document.addEventListener('DOMContentLoaded', () => {
  const input    = document.getElementById('input');
  const slugOut  = document.getElementById('slug-output');
  const urlPrev  = document.getElementById('slug-in-url');
  const separator = document.getElementById('separator');
  const maxLen   = document.getElementById('max-len');

  const STOP_WORDS = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','up','is','was','are','were','be','been','being','do','does','did','has','have','had','it','its','this','that','these','those','i','you','he','she','we','they']);

  const translitMap = {
    'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae','ç':'c','è':'e','é':'e','ê':'e','ë':'e',
    'ì':'i','í':'i','î':'i','ï':'i','ñ':'n','ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','ù':'u',
    'ú':'u','û':'u','ü':'u','ý':'y','ÿ':'y','ß':'ss','œ':'oe','š':'s','ž':'z','č':'c','ĺ':'l','ŕ':'r'
  };

  function toSlug(text) {
    const sep      = separator.value;
    const lower    = document.getElementById('opt-lowercase').checked;
    const stripNums = document.getElementById('opt-strip-numbers').checked;
    const stripStop = document.getElementById('opt-strip-stopwords').checked;
    const maxL     = parseInt(maxLen.value) || 80;

    // Transliterate
    let slug = text.split('').map(c => translitMap[c.toLowerCase()] || c).join('');

    if (lower) slug = slug.toLowerCase();

    // Remove HTML tags
    slug = slug.replace(/<[^>]*>/g, '');

    // Replace special chars with separator
    slug = slug.replace(/[^a-zA-Z0-9\s]/g, sep);

    // Split into words
    let words = slug.trim().split(/\s+/).filter(Boolean);

    if (stripNums) words = words.filter(w => !/^\d+$/.test(w));
    if (stripStop) words = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));

    slug = words.join(sep);

    // Clean multiple separators
    const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    slug = slug.replace(new RegExp(`${escapedSep}+`, 'g'), sep);
    slug = slug.replace(new RegExp(`^${escapedSep}|${escapedSep}$`, 'g'), '');

    // Max length
    if (slug.length > maxL) {
      slug = slug.substring(0, maxL);
      const lastSep = slug.lastIndexOf(sep);
      if (lastSep > maxL * 0.7) slug = slug.substring(0, lastSep);
    }

    return slug;
  }

  function update() {
    const text = input.value;
    const slug = text.trim() ? toSlug(text) : '';
    slugOut.textContent = slug || '—';
    urlPrev.textContent = slug || 'your-slug-here';

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('stat-len').textContent = slug.length;
    document.getElementById('stat-words').textContent = words;
    const seoEl = document.getElementById('stat-seo');
    if (!slug) { seoEl.textContent = '—'; seoEl.style.color = ''; }
    else if (slug.length <= 60) { seoEl.textContent = '✓ Good'; seoEl.style.color = 'var(--color-green)'; }
    else if (slug.length <= 80) { seoEl.textContent = '⚠ OK'; seoEl.style.color = 'var(--color-yellow)'; }
    else { seoEl.textContent = '✗ Long'; seoEl.style.color = 'var(--color-red)'; }
  }

  input.addEventListener('input', update);
  separator.addEventListener('change', update);
  maxLen.addEventListener('input', update);
  ['opt-lowercase','opt-strip-numbers','opt-strip-stopwords'].forEach(id => {
    document.getElementById(id).addEventListener('change', update);
  });

  document.getElementById('btn-copy').addEventListener('click', () => {
    const slug = slugOut.textContent;
    if (!slug || slug === '—') { showToast('Generate a slug first.', 'warning'); return; }
    navigator.clipboard.writeText(slug).then(() => showToast('Slug copied!', 'success'));
  });

  document.getElementById('btn-copy-url').addEventListener('click', () => {
    const slug = slugOut.textContent;
    if (!slug || slug === '—') { showToast('Generate a slug first.', 'warning'); return; }
    const url = `https://yoursite.com/${slug}/`;
    navigator.clipboard.writeText(url).then(() => showToast('URL copied!', 'success'));
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    input.value = '';
    update();
  });
});
