document.addEventListener('DOMContentLoaded', function () {
  const textInput = document.getElementById('text-input');
  const morseInput = document.getElementById('morse-input');
  const btnToMorse = document.getElementById('btn-to-morse');
  const btnToText = document.getElementById('btn-to-text');
  const btnPlay = document.getElementById('btn-play');
  const btnCopy = document.getElementById('btn-copy');

  // Complete Morse code map A-Z, 0-9
  const MORSE_MAP = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
    'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
    'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
    'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
    'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
    'Y': '-.--',  'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
    '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
    '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
    '@': '.--.-.', "'": '.----.'
  };

  // Reverse map for decoding
  const REVERSE_MAP = {};
  for (var key in MORSE_MAP) {
    REVERSE_MAP[MORSE_MAP[key]] = key;
  }

  btnToMorse.addEventListener('click', function () {
    var text = textInput.value.trim();
    if (!text) {
      showToast('Please enter text to translate.', 'error');
      return;
    }
    var result = textToMorse(text);
    morseInput.value = result;
    showToast('Converted to Morse code!', 'success');
  });

  btnToText.addEventListener('click', function () {
    var morse = morseInput.value.trim();
    if (!morse) {
      showToast('Please enter Morse code to translate.', 'error');
      return;
    }
    var result = morseToText(morse);
    textInput.value = result;
    showToast('Converted to text!', 'success');
  });

  btnCopy.addEventListener('click', function () {
    var content = morseInput.value;
    if (!content) {
      showToast('Nothing to copy.', 'error');
      return;
    }
    navigator.clipboard.writeText(content).then(function () {
      showToast('Morse code copied!', 'success');
    }).catch(function () {
      showToast('Copy failed.', 'error');
    });
  });

  btnPlay.addEventListener('click', function () {
    var morse = morseInput.value.trim();
    if (!morse) {
      showToast('Generate Morse code first.', 'error');
      return;
    }
    playMorse(morse);
  });

  function textToMorse(text) {
    return text.toUpperCase().split('').map(function (ch) {
      if (ch === ' ') return '/';
      return MORSE_MAP[ch] || '';
    }).filter(function (s) { return s !== ''; }).join(' ');
  }

  function morseToText(morse) {
    return morse.split(' / ').map(function (word) {
      return word.split(' ').map(function (code) {
        return REVERSE_MAP[code] || '';
      }).join('');
    }).join(' ');
  }

  function playMorse(morse) {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var dotDuration = 0.1;    // 100ms
    var dashDuration = 0.3;   // 300ms
    var intraGap = 0.05;      // gap within letter
    var letterGap = 0.15;     // gap between letters
    var wordGap = 0.35;       // gap between words

    var currentTime = audioCtx.currentTime + 0.05;

    btnPlay.disabled = true;
    btnPlay.textContent = '... Playing';

    for (var i = 0; i < morse.length; i++) {
      var ch = morse[i];
      if (ch === '.') {
        playTone(audioCtx, currentTime, dotDuration);
        currentTime += dotDuration + intraGap;
      } else if (ch === '-') {
        playTone(audioCtx, currentTime, dashDuration);
        currentTime += dashDuration + intraGap;
      } else if (ch === '/') {
        currentTime += wordGap;
      } else if (ch === ' ') {
        currentTime += letterGap;
      }
    }

    var totalDuration = (currentTime - audioCtx.currentTime) * 1000;
    setTimeout(function () {
      btnPlay.disabled = false;
      btnPlay.textContent = '\u25B6 Play Audio';
      showToast('Playback complete!', 'success');
    }, totalDuration + 200);
  }

  function playTone(audioCtx, startTime, duration) {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = 600;
    gainNode.gain.setValueAtTime(0.5, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // showToast fallback
  function showToast(message, type) {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }
    var toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:8px;color:#fff;font-size:14px;z-index:9999;transition:opacity .3s ease;' +
      (type === 'error' ? 'background:#e53935;' : 'background:#43a047;');
    document.body.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }
});
