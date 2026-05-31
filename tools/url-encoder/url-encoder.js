document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const output = document.getElementById('output');

  document.getElementById('btn-encode').addEventListener('click', () => {
    try { output.value = encodeURIComponent(input.value); showToast('URL encoded.', 'success'); }
    catch (e) { showToast('Encoding failed.', 'error'); }
  });
  document.getElementById('btn-decode').addEventListener('click', () => {
    try { output.value = decodeURIComponent(input.value); showToast('URL decoded.', 'success'); }
    catch (e) { showToast('Invalid encoded string.', 'error'); }
  });
  document.getElementById('btn-encode-full').addEventListener('click', () => {
    try { output.value = encodeURI(input.value); showToast('Full URI encoded.', 'success'); }
    catch (e) { showToast('Encoding failed.', 'error'); }
  });
  document.getElementById('btn-copy').addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => showToast('Copied!', 'success'));
  });
});
