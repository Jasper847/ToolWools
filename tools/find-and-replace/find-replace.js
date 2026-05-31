document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const findInput = document.getElementById('find');
  const replaceInput = document.getElementById('replace');
  const caseSensitive = document.getElementById('case-sensitive');
  const useRegex = document.getElementById('use-regex');
  const matchCount = document.getElementById('match-count');
  const btnReplaceAll = document.getElementById('btn-replace-all');
  const btnCopy = document.getElementById('btn-copy');
  const output = document.getElementById('output');

  function getRegex() {
    const find = findInput.value;
    if (!find) return null;
    const flags = 'g' + (caseSensitive.checked ? '' : 'i');
    try {
      return useRegex.checked ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    } catch (e) {
      showToast('Invalid regex pattern: ' + e.message, 'error');
      return null;
    }
  }

  function updateMatchCount() {
    const regex = getRegex();
    if (!regex) { matchCount.textContent = '0 matches'; return; }
    const matches = input.value.match(regex);
    matchCount.textContent = (matches ? matches.length : 0) + ' matches';
  }

  [findInput, input, caseSensitive, useRegex].forEach(el => {
    el.addEventListener('input', updateMatchCount);
    el.addEventListener('change', updateMatchCount);
  });

  btnReplaceAll.addEventListener('click', () => {
    const regex = getRegex();
    if (!regex) { showToast('Enter a search term.', 'warning'); return; }
    output.value = input.value.replace(regex, replaceInput.value);
    const matches = input.value.match(regex);
    showToast(`Replaced ${matches ? matches.length : 0} occurrence(s).`, 'success');
  });

  btnCopy.addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => showToast('Copied!', 'success'));
  });
});
