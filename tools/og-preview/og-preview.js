document.addEventListener('DOMContentLoaded', () => {
  const ogUrl = document.getElementById('og-url');
  const ogTitle = document.getElementById('og-title');
  const ogDesc = document.getElementById('og-desc');
  const ogImage = document.getElementById('og-image');
  const cardImg = document.getElementById('card-img');
  const cardUrl = document.getElementById('card-url');
  const cardTitle = document.getElementById('card-title');
  const cardDesc = document.getElementById('card-desc');
  const btnPreview = document.getElementById('btn-preview');

  function update() {
    try {
      const url = new URL(ogUrl.value);
      cardUrl.textContent = url.hostname;
    } catch { cardUrl.textContent = ogUrl.value; }
    cardTitle.textContent = ogTitle.value || 'Untitled';
    cardDesc.textContent = ogDesc.value || '';
    cardImg.src = ogImage.value || '';
    cardImg.onerror = () => { cardImg.src = ''; cardImg.alt = 'Image not found'; };
  }

  btnPreview.addEventListener('click', () => { update(); showToast('Preview updated.', 'success'); });

  // Live update
  [ogUrl, ogTitle, ogDesc, ogImage].forEach(el => el.addEventListener('input', update));
});
