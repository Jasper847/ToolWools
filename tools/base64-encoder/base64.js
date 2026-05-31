document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const btnEncode = document.getElementById('btn-encode');
  const btnDecode = document.getElementById('btn-decode');
  const btnCopy = document.getElementById('btn-copy');

  btnEncode.addEventListener('click', () => {
    try {
      output.value = btoa(unescape(encodeURIComponent(input.value)));
      showToast('Encoded to Base64.', 'success');
    } catch (e) { showToast('Encoding failed: ' + e.message, 'error'); }
  });

  btnDecode.addEventListener('click', () => {
    try {
      output.value = decodeURIComponent(escape(atob(input.value.trim())));
      showToast('Decoded from Base64.', 'success');
    } catch (e) { showToast('Invalid Base64 string.', 'error'); }
  });

  btnCopy.addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => showToast('Copied!', 'success'));
  });
});
