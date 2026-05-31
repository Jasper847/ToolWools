document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <div class="tool-panel">
      <div class="tool-panel-title">
        <div style="display:flex;align-items:center;gap:8px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
          <span>Voice Reader</span>
        </div>
      </div>
      <label for="tts-input" class="sr-only">Text to speak</label>
      <textarea id="tts-input" class="tool-textarea" rows="8" placeholder="Enter or paste text you want to hear spoken aloud...&#10;&#10;Try: The quick brown fox jumps over the lazy dog."></textarea>
      <div class="tool-controls-row">
        <label>Voice: <select id="voice-select" class="tool-select" style="max-width:300px"></select></label>
        <label>Speed: <input type="range" id="rate" min="0.5" max="2" step="0.1" value="1" class="tool-range"> <span id="rate-val">1.0x</span></label>
        <label>Pitch: <input type="range" id="pitch" min="0" max="2" step="0.1" value="1" class="tool-range"> <span id="pitch-val">1.0</span></label>
      </div>
      <div class="tool-bottom-actions">
        <button id="btn-speak" class="btn btn-primary">▶ Speak</button>
        <button id="btn-pause" class="btn btn-secondary" disabled>⏸ Pause</button>
        <button id="btn-stop" class="btn btn-secondary" disabled>⏹ Stop</button>
      </div>
      <div id="tts-status" class="tool-badge" style="margin-top:12px;display:none"></div>
    </div>`;

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

    utterance.onstart = () => { updateButtons('speaking'); status.textContent = 'Speaking...'; status.style.display = 'inline-block'; };
    utterance.onend = () => { updateButtons('idle'); status.textContent = 'Done!'; status.style.display = 'inline-block'; showToast('Speech complete.', 'success'); };
    utterance.onerror = (e) => { updateButtons('idle'); status.textContent = ''; status.style.display = 'none'; showToast('Speech error: ' + e.error, 'error'); };
    utterance.onpause = () => { updateButtons('paused'); status.style.display = 'inline-block'; };
    utterance.onresume = () => { updateButtons('speaking'); status.style.display = 'inline-block'; };

    synth.speak(utterance);
  });

  btnPause.addEventListener('click', () => {
    if (synth.speaking && !synth.paused) { synth.pause(); status.textContent = 'Paused'; status.style.display = 'inline-block'; }
    else if (synth.paused) { synth.resume(); status.textContent = 'Speaking...'; status.style.display = 'inline-block'; }
  });

  btnStop.addEventListener('click', () => {
    synth.cancel();
    updateButtons('idle');
    status.textContent = 'Stopped';
    status.style.display = 'inline-block';
  });

  function updateButtons(state) {
    btnSpeak.disabled = state === 'speaking';
    btnPause.disabled = state === 'idle';
    btnStop.disabled = state === 'idle';
    btnSpeak.textContent = state === 'paused' ? '▶ Resume' : '▶ Speak';
  }
});
