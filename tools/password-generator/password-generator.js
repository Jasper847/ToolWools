document.addEventListener('DOMContentLoaded', () => {
  const lengthSlider = document.getElementById('length');
  const lengthVal = document.getElementById('length-val');
  const optUpper = document.getElementById('opt-upper');
  const optLower = document.getElementById('opt-lower');
  const optDigits = document.getElementById('opt-digits');
  const optSymbols = document.getElementById('opt-symbols');
  const output = document.getElementById('password-output');
  const strength = document.getElementById('strength');
  const btnGenerate = document.getElementById('btn-generate');
  const btnCopy = document.getElementById('btn-copy');

  const CHARS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  lengthSlider.addEventListener('input', () => { lengthVal.textContent = lengthSlider.value; });

  function generate() {
    let charset = '';
    if (optUpper.checked) charset += CHARS.upper;
    if (optLower.checked) charset += CHARS.lower;
    if (optDigits.checked) charset += CHARS.digits;
    if (optSymbols.checked) charset += CHARS.symbols;
    if (!charset) { showToast('Select at least one character type.', 'warning'); return; }

    const len = parseInt(lengthSlider.value);
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let password = '';
    for (let i = 0; i < len; i++) password += charset[arr[i] % charset.length];
    output.value = password;

    // Strength estimate
    const poolSize = charset.length;
    const entropy = Math.round(len * Math.log2(poolSize));
    let label = 'Weak';
    if (entropy >= 128) label = 'Very Strong';
    else if (entropy >= 80) label = 'Strong';
    else if (entropy >= 50) label = 'Moderate';
    strength.textContent = `Entropy: ${entropy} bits — ${label}`;
  }

  btnGenerate.addEventListener('click', generate);
  btnCopy.addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => showToast('Password copied!', 'success'));
  });

  generate();
});
