/* Color Palette Generator JS — Phase 5 */
document.addEventListener('DOMContentLoaded', () => {
  let currentPalette = [];

  // ---- Color Math ----
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h = ((g-b)/d + (g<b?6:0))/6; break;
        case g: h = ((b-r)/d + 2)/6; break;
        case b: h = ((r-g)/d + 4)/6; break;
      }
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h/30) % 12;
    const a = s * Math.min(l, 1-l);
    const f = n => l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
    return '#' + [f(0),f(8),f(4)].map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('');
  }

  function hexToRgb(hex) {
    return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
  }

  function generatePalette(baseHex, harmony) {
    const [h, s, l] = hexToHsl(baseHex);
    switch (harmony) {
      case 'complementary':
        return [baseHex, hslToHex((h+180)%360, s, l), hslToHex(h, s, Math.min(90,l+20)), hslToHex((h+180)%360, s, Math.min(90,l+20)), hslToHex(h, s, Math.max(10,l-20))];
      case 'analogous':
        return [-30,-15,0,15,30].map(d => hslToHex((h+d+360)%360, s, l));
      case 'triadic':
        return [baseHex, hslToHex((h+120)%360, s, l), hslToHex((h+240)%360, s, l), hslToHex(h, s, Math.min(90,l+15)), hslToHex(h, s, Math.max(10,l-15))];
      case 'split-complementary':
        return [baseHex, hslToHex((h+150)%360, s, l), hslToHex((h+210)%360, s, l), hslToHex(h, Math.max(0,s-20), l), hslToHex((h+180)%360, s, l)];
      case 'tetradic':
        return [0,90,180,270].map(d => hslToHex((h+d)%360, s, l)).concat([hslToHex(h, s, Math.min(85,l+15))]);
      case 'monochromatic':
        return [20,35,50,65,80].map(shade => hslToHex(h, s, shade));
      default:
        return [baseHex];
    }
  }

  function getLuminance(hex) {
    const [r,g,b] = hexToRgb(hex).map(c => { c /= 255; return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); });
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }

  function getContrastColor(hex) {
    return getLuminance(hex) > 0.35 ? '#111827' : '#FFFFFF';
  }

  function renderPalette(palette) {
    currentPalette = palette;
    const display = document.getElementById('palette-display');
    const grid    = document.getElementById('swatches-grid');

    // Palette bar
    display.innerHTML = palette.map(c => `<div class="palette-swatch" style="background:${c}" title="${c}"><span class="palette-swatch-label">${c.toUpperCase()}</span></div>`).join('');

    // Swatch cards
    grid.innerHTML = palette.map((color, i) => {
      const [h,s,l] = hexToHsl(color);
      const rgb = hexToRgb(color);
      const textColor = getContrastColor(color);
      return `
        <div style="border-radius:16px;overflow:hidden;border:1.5px solid var(--color-border);cursor:pointer" onclick="navigator.clipboard.writeText('${color}').then(()=>showToast('Copied ${color}!','success'))">
          <div style="height:90px;background:${color};display:flex;align-items:center;justify-content:center">
            <span style="font-family:'Fira Code',monospace;font-size:13px;font-weight:700;color:${textColor};text-shadow:0 1px 2px rgba(0,0,0,0.15)">${color.toUpperCase()}</span>
          </div>
          <div style="padding:10px 12px;background:var(--color-surface)">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--color-muted);margin-bottom:4px">Swatch ${i+1}</div>
            <div style="font-size:11px;font-family:'Fira Code',monospace;color:var(--color-muted)">rgb(${rgb.join(', ')})</div>
            <div style="font-size:11px;font-family:'Fira Code',monospace;color:var(--color-muted)">hsl(${h}°, ${s}%, ${l}%)</div>
          </div>
        </div>`;
    }).join('');
  }

  function doGenerate() {
    const base    = document.getElementById('base-color').value;
    const harmony = document.getElementById('harmony').value;
    const palette = generatePalette(base, harmony);
    renderPalette(palette);
  }

  document.getElementById('btn-generate').addEventListener('click', doGenerate);
  document.getElementById('base-color').addEventListener('input', doGenerate);
  document.getElementById('harmony').addEventListener('change', doGenerate);

  document.getElementById('btn-random').addEventListener('click', () => {
    const hex = '#' + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');
    document.getElementById('base-color').value = hex;
    doGenerate();
  });

  document.getElementById('btn-export-css').addEventListener('click', () => {
    if (!currentPalette.length) { showToast('Generate palette first.', 'warning'); return; }
    const harmony = document.getElementById('harmony').value;
    const css = `:root {\n  /* ${harmony} palette */\n` +
      currentPalette.map((c,i) => `  --color-${i+1}: ${c};`).join('\n') + '\n}';
    document.getElementById('export-output').value = css;
    showToast('CSS variables exported!', 'success');
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    if (!currentPalette.length) { showToast('Generate palette first.', 'warning'); return; }
    const data = currentPalette.map((c,i) => {
      const [h,s,l] = hexToHsl(c);
      const [r,g,b] = hexToRgb(c);
      return { index: i+1, hex: c, rgb: { r,g,b }, hsl: { h,s,l } };
    });
    document.getElementById('export-output').value = JSON.stringify(data, null, 2);
    showToast('JSON exported!', 'success');
  });

  document.getElementById('btn-copy-hex').addEventListener('click', () => {
    if (!currentPalette.length) { showToast('Generate palette first.', 'warning'); return; }
    navigator.clipboard.writeText(currentPalette.join('\n')).then(() => showToast('All HEX codes copied!', 'success'));
  });

  // Auto-generate on load
  doGenerate();
});
