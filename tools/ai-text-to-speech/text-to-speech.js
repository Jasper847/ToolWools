document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <label for="tts-input" class="sr-only">Text to speak</label>
    <textarea id="tts-input" class="tool-textarea" rows="8" placeholder="Enter or paste text you want to hear spoken aloud...&#10;&#10;Try: The quick brown fox jumps over the lazy dog."></textarea>
    <div class="tool-controls-row">
      <label>Voice: <select id="voice-select" class="tool-select"></select></label>
      <label>Speed: <input type="range" id="rate" min="0.5" max="2" step="0.1" value="1" class="tool-range"> <span id="rate-val">1.0x</span></label>
      <label>Pitch: <input type="range" id="pitch" min="0" max="2" step="0.1" value="1" class="tool-range"> <span id="pitch-val">1.0</span></label>
    </div>
    <div class="tool-bottom-actions">
      <button id="btn-speak" class="btn btn-primary">▶ Speak</button>
      <button id="btn-pause" class="btn btn-secondary" disabled>⏸ Pause</button>
      <button id="btn-stop" class="btn btn-secondary" disabled>⏹ Stop</button>
    </div>
    <div id="tts-status" class="tool-badge" style="margin-top:12px"></div>`;

  const input = document.getElementById('tts-input');
  const voiceSelect = document.getElementById('voice-select');
  const rateSlider = document.getElementById('rate');
  const pitchSlider = document.getElementById('pitch');
  const rateVal = document.getElementById('rate-val');
  const pitchVal = document.getElementById('pitch-val');
  const btnSpeak = document.getElementById('btn-speak');
  const btnPause = document.getElementById('btn-pause');
  const btnStop = document.getElementById('btn-stop');
  const status = document.getElementById('tts-status');

  const synth = window.speechSynthesis;
  let voices = [];
  let utterance = null;

  function loadVoices() {
    voices = synth.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' ★' : ''}`;
      voiceSelect.appendChild(opt);
    });
    // Select a good English voice by default
    const engIdx = voices.findIndex(v => v.lang.startsWith('en') && v.default);
    if (engIdx >= 0) voiceSelect.value = engIdx;
  }

  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
  loadVoices();

  rateSlider.addEventListener('input', () => { rateVal.textContent = rateSlider.value + 'x'; });
  pitchSlider.addEventListener('input', () => { pitchVal.textContent = pitchSlider.value; });

  btnSpeak.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) { showToast('Enter some text to speak.', 'warning'); return; }
    if (synth.speaking && synth.paused) { synth.resume(); updateButtons('speaking'); return; }
    if (synth.speaking) synth.cancel();

    utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[voiceSelect.value] || null;
    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);

    utterance.onstart = () => { updateButtons('speaking'); status.textContent = 'Speaking...'; };
    utterance.onend = () => { updateButtons('idle'); status.textContent = 'Done!'; showToast('Speech complete.', 'success'); };
    utterance.onerror = (e) => { updateButtons('idle'); status.textContent = ''; showToast('Speech error: ' + e.error, 'error'); };
    utterance.onpause = () => updateButtons('paused');
    utterance.onresume = () => updateButtons('speaking');

    synth.speak(utterance);
  });

  btnPause.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) { synth.pause(); status.textContent = 'Paused'; }
    else if (synth.paused) { synth.resume(); status.textContent = 'Speaking...'; }
  });

  btnStop.addEventListener('click', () => {
    synth.cancel();
    updateButtons('idle');
    status.textContent = 'Stopped';
  });

  function updateButtons(state) {
    btnSpeak.disabled = state === 'speaking';
    btnPause.disabled = state === 'idle';
    btnStop.disabled = state === 'idle';
    btnSpeak.textContent = state === 'paused' ? '▶ Resume' : '▶ Speak';
  }
});
