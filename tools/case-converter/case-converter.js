document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const btnCopy = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');

  const converters = {
    upper: t => t.toUpperCase(),
    lower: t => t.toLowerCase(),
    title: t => t.toLowerCase().replace(/(?:^|\s|[-/])\S/g, c => c.toUpperCase()),
    sentence: t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase()),
    camel: t => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    snake: t => t.replace(/\s+/g, '_').replace(/([A-Z])/g, '_$1').replace(/__+/g, '_').toLowerCase().replace(/^_/, ''),
    kebab: t => t.replace(/\s+/g, '-').replace(/([A-Z])/g, '-$1').replace(/--+/g, '-').toLowerCase().replace(/^-/, ''),
    toggle: t => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('')
  };

  document.querySelectorAll('[data-case]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = input.value;
      if (!text.trim()) { showToast('Please enter some text first.', 'warning'); return; }
      const fn = converters[btn.dataset.case];
      output.value = fn ? fn(text) : text;
    });
  });

  btnCopy.addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => showToast('Copied to clipboard!', 'success'));
  });

  btnClear.addEventListener('click', () => { input.value = ''; output.value = ''; });
});
