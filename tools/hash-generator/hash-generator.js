document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const hashOutput = document.getElementById('hash-output');
  const algoLabel = document.getElementById('algo-label');

  async function generateHash(algo) {
    const text = input.value;
    if (!text) { showToast('Enter some text to hash.', 'warning'); return; }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    hashOutput.value = hex;
    algoLabel.textContent = algo;
    showToast(algo + ' hash generated.', 'success');
  }

  document.querySelectorAll('[data-algo]').forEach(btn => {
    btn.addEventListener('click', () => generateHash(btn.dataset.algo));
  });

  document.getElementById('btn-copy').addEventListener('click', () => {
    if (!hashOutput.value) return;
    navigator.clipboard.writeText(hashOutput.value).then(() => showToast('Hash copied!', 'success'));
  });
});
