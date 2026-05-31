document.addEventListener('DOMContentLoaded', () => {
  const picker = document.getElementById('picker');
  const hexInput = document.getElementById('hex-input');
  const preview = document.getElementById('preview');
  const outHex = document.getElementById('out-hex');
  const outRgb = document.getElementById('out-rgb');
  const outHsl = document.getElementById('out-hsl');

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const n = parseInt(hex, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function update(hex) {
    hex = hex.startsWith('#') ? hex : '#' + hex;
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex) && !/^#[0-9A-Fa-f]{3}$/.test(hex)) return;
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const fullHex = '#' + [rgb.r, rgb.g, rgb.b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();

    preview.style.background = fullHex;
    picker.value = fullHex;
    hexInput.value = fullHex;
    outHex.textContent = fullHex;
    outRgb.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    outHsl.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  }

  picker.addEventListener('input', () => update(picker.value));
  hexInput.addEventListener('input', () => update(hexInput.value));

  document.getElementById('btn-copy-hex').addEventListener('click', () => { navigator.clipboard.writeText(outHex.textContent).then(() => showToast('HEX copied!', 'success')); });
  document.getElementById('btn-copy-rgb').addEventListener('click', () => { navigator.clipboard.writeText(outRgb.textContent).then(() => showToast('RGB copied!', 'success')); });
  document.getElementById('btn-copy-hsl').addEventListener('click', () => { navigator.clipboard.writeText(outHsl.textContent).then(() => showToast('HSL copied!', 'success')); });

  update('#F4511E');
});
