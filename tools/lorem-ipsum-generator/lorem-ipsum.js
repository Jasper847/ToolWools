document.addEventListener('DOMContentLoaded', () => {
  const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');

  const output = document.getElementById('output');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopy = document.getElementById('btn-copy');
  const amountInput = document.getElementById('amount');
  const unitSelect = document.getElementById('unit');

  function randomWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }

  function generateSentence(minWords, maxWords) {
    const len = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
    const words = Array.from({length: len}, randomWord);
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  }

  function generateParagraph() {
    const count = 4 + Math.floor(Math.random() * 5);
    return Array.from({length: count}, () => generateSentence(6, 16)).join(' ');
  }

  function generate() {
    const amount = Math.max(1, Math.min(100, parseInt(amountInput.value) || 5));
    const unit = unitSelect.value;
    let result = '';

    if (unit === 'paragraphs') {
      result = Array.from({length: amount}, generateParagraph).join('\n\n');
    } else if (unit === 'sentences') {
      result = Array.from({length: amount}, () => generateSentence(8, 18)).join(' ');
    } else {
      result = Array.from({length: amount}, randomWord).join(' ');
      result = result[0].toUpperCase() + result.slice(1) + '.';
    }
    output.value = result;
  }

  btnGenerate.addEventListener('click', generate);
  btnCopy.addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => showToast('Copied to clipboard!', 'success'));
  });

  generate(); // auto-generate on load
});
