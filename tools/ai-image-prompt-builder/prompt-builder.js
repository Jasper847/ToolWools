document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <div class="tool-controls-row" style="flex-direction:column;gap:12px;align-items:stretch">
      <label>Subject / Scene: <input type="text" id="subject" class="tool-input" placeholder="e.g. A futuristic city skyline at sunset"></label>
      <label>Art Style: <select id="style" class="tool-select">
        <option value="">Choose style...</option>
        <option value="photorealistic, 8K, ultra-detailed">Photorealistic</option>
        <option value="oil painting, textured brushstrokes, classical">Oil Painting</option>
        <option value="digital art, vibrant colors, trending on ArtStation">Digital Art</option>
        <option value="watercolor, soft edges, delicate washes">Watercolor</option>
        <option value="anime style, cel-shaded, Studio Ghibli inspired">Anime</option>
        <option value="3D render, Octane, volumetric lighting">3D Render</option>
        <option value="pencil sketch, hand-drawn, detailed linework">Pencil Sketch</option>
        <option value="pixel art, retro, 16-bit">Pixel Art</option>
        <option value="cyberpunk, neon lights, futuristic">Cyberpunk</option>
        <option value="minimalist, clean lines, flat design">Minimalist</option>
      </select></label>
      <label>Lighting: <select id="lighting" class="tool-select">
        <option value="">Choose lighting...</option>
        <option value="golden hour, warm sunlight">Golden Hour</option>
        <option value="dramatic lighting, high contrast, chiaroscuro">Dramatic</option>
        <option value="soft diffused light, overcast">Soft/Diffused</option>
        <option value="neon glow, colorful rim lighting">Neon Glow</option>
        <option value="studio lighting, three-point setup">Studio</option>
        <option value="moonlit, cool blue tones, nighttime">Moonlit</option>
        <option value="backlighting, silhouette, halo effect">Backlit</option>
      </select></label>
      <label>Mood / Atmosphere: <select id="mood" class="tool-select">
        <option value="">Choose mood...</option>
        <option value="serene, peaceful, calm">Serene</option>
        <option value="epic, grand, majestic">Epic</option>
        <option value="mysterious, dark, enigmatic">Mysterious</option>
        <option value="whimsical, playful, fantastical">Whimsical</option>
        <option value="melancholic, moody, contemplative">Melancholic</option>
        <option value="energetic, dynamic, vibrant">Energetic</option>
      </select></label>
      <label>Camera / Perspective: <select id="camera" class="tool-select">
        <option value="">Choose perspective...</option>
        <option value="wide-angle lens, expansive view">Wide Angle</option>
        <option value="close-up, macro, detailed">Close-up</option>
        <option value="bird's-eye view, overhead">Bird's Eye</option>
        <option value="low angle, looking up, imposing">Low Angle</option>
        <option value="portrait, shallow depth of field, bokeh">Portrait (Bokeh)</option>
        <option value="isometric, 3D perspective">Isometric</option>
      </select></label>
      <label>Aspect Ratio: <select id="aspect" class="tool-select">
        <option value="--ar 1:1">1:1 (Square)</option>
        <option value="--ar 16:9" selected>16:9 (Landscape)</option>
        <option value="--ar 9:16">9:16 (Portrait)</option>
        <option value="--ar 4:3">4:3 (Standard)</option>
        <option value="--ar 21:9">21:9 (Ultrawide)</option>
      </select></label>
      <label>Quality / Extras: <input type="text" id="extras" class="tool-input" placeholder="e.g. highly detailed, 4K, award-winning"></label>
    </div>
    <div class="tool-bottom-actions" style="margin-top:16px">
      <button id="btn-generate" class="btn btn-primary">Generate Prompt</button>
      <button id="btn-copy" class="btn btn-secondary">Copy Prompt</button>
      <button id="btn-random" class="btn btn-secondary">🎲 Random</button>
    </div>
    <label for="output" class="sr-only">Generated prompt</label>
    <textarea id="output" class="tool-textarea" rows="6" readonly placeholder="Your AI image prompt will appear here..." style="font-size:15px;line-height:1.7;margin-top:16px"></textarea>
    <div id="prompt-stats" class="tool-badge" style="margin-top:12px"></div>`;

  const subject=document.getElementById('subject'),style=document.getElementById('style'),
    lighting=document.getElementById('lighting'),mood=document.getElementById('mood'),
    camera=document.getElementById('camera'),aspect=document.getElementById('aspect'),
    extras=document.getElementById('extras'),output=document.getElementById('output'),
    stats=document.getElementById('prompt-stats');

  function generate() {
    const parts = [];
    if (subject.value.trim()) parts.push(subject.value.trim());
    if (style.value) parts.push(style.value);
    if (lighting.value) parts.push(lighting.value);
    if (mood.value) parts.push(mood.value);
    if (camera.value) parts.push(camera.value);
    if (extras.value.trim()) parts.push(extras.value.trim());
    if (!parts.length) { showToast('Add at least a subject to generate a prompt.','warning'); return; }
    let prompt = parts.join(', ');
    if (aspect.value) prompt += ' ' + aspect.value;
    output.value = prompt;
    stats.textContent = `${prompt.length} characters | ${prompt.split(/\s+/).length} words`;
    showToast('Prompt generated!','success');
  }

  document.getElementById('btn-generate').addEventListener('click', generate);
  document.getElementById('btn-copy').addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value).then(() => showToast('Prompt copied!','success'));
  });
  document.getElementById('btn-random').addEventListener('click', () => {
    const subjects=['A lone astronaut floating above Saturn','An ancient Japanese temple in cherry blossom season','A massive dragon perched on a crystal mountain','Underwater city with bioluminescent creatures','A cozy cabin in a snowy forest at night'];
    subject.value = subjects[Math.floor(Math.random()*subjects.length)];
    [style,lighting,mood,camera].forEach(s=>{const opts=s.querySelectorAll('option[value]:not([value=""])');if(opts.length)s.value=opts[Math.floor(Math.random()*opts.length)].value;});
    generate();
  });

  // Auto-generate on any change
  [subject,style,lighting,mood,camera,aspect,extras].forEach(el=>el.addEventListener('change',generate));
  subject.addEventListener('input',generate);extras.addEventListener('input',generate);
});
