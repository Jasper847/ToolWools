document.addEventListener('DOMContentLoaded', function () {
  var btnGenerate = document.getElementById('btn-generate');
  var btnCopy = document.getElementById('btn-copy');
  var outputEl = document.getElementById('output');
  var countEl = document.getElementById('count');
  var typeEl = document.getElementById('type');
  var sepEl = document.getElementById('sep');

  // Word bank — 200+ common English words
  var WORDS = [
    'time', 'year', 'people', 'way', 'day', 'man', 'woman', 'child', 'world', 'life',
    'hand', 'part', 'place', 'case', 'week', 'company', 'system', 'program', 'question', 'work',
    'government', 'number', 'night', 'point', 'home', 'water', 'room', 'mother', 'area', 'money',
    'story', 'fact', 'month', 'lot', 'right', 'study', 'book', 'eye', 'job', 'word',
    'business', 'issue', 'side', 'kind', 'head', 'house', 'service', 'friend', 'father', 'power',
    'hour', 'game', 'line', 'end', 'member', 'law', 'car', 'city', 'community', 'name',
    'president', 'team', 'minute', 'idea', 'body', 'information', 'back', 'parent', 'face', 'others',
    'level', 'office', 'door', 'health', 'person', 'art', 'war', 'history', 'party', 'result',
    'change', 'morning', 'reason', 'research', 'girl', 'guy', 'moment', 'air', 'teacher', 'force',
    'education', 'apple', 'mountain', 'river', 'ocean', 'forest', 'garden', 'bridge', 'castle', 'planet',
    'rocket', 'guitar', 'piano', 'violin', 'camera', 'mirror', 'window', 'shadow', 'thunder', 'crystal',
    'diamond', 'silver', 'golden', 'purple', 'orange', 'yellow', 'scarlet', 'emerald', 'sapphire', 'copper',
    'velvet', 'marble', 'ancient', 'modern', 'digital', 'cosmic', 'arctic', 'tropical', 'desert', 'frozen',
    'silent', 'gentle', 'fierce', 'brave', 'clever', 'humble', 'noble', 'swift', 'calm', 'bright',
    'dark', 'warm', 'cold', 'wild', 'free', 'deep', 'tall', 'wide', 'soft', 'loud',
    'dream', 'spirit', 'flame', 'storm', 'cloud', 'star', 'moon', 'light', 'stone', 'wave',
    'eagle', 'falcon', 'tiger', 'wolf', 'bear', 'whale', 'dolphin', 'hawk', 'lion', 'deer',
    'phoenix', 'dragon', 'unicorn', 'griffin', 'mermaid', 'wizard', 'knight', 'queen', 'king', 'sage',
    'harbor', 'beacon', 'voyage', 'anchor', 'compass', 'lantern', 'caravan', 'summit', 'valley', 'meadow',
    'sunrise', 'sunset', 'twilight', 'horizon', 'eclipse', 'rainbow', 'glacier', 'volcano', 'island', 'canyon',
    'puzzle', 'riddle', 'quest', 'journey', 'adventure', 'legend', 'myth', 'fable', 'saga', 'chronicle'
  ];

  // Names bank — 100+ first names
  var NAMES = [
    'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
    'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
    'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
    'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah',
    'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia',
    'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna',
    'Stephen', 'Brenda', 'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
    'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra', 'Frank', 'Rachel',
    'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine', 'Dennis', 'Maria', 'Jerry', 'Heather',
    'Tyler', 'Diane', 'Aaron', 'Ruth', 'Jose', 'Julie', 'Adam', 'Olivia', 'Nathan', 'Joyce',
    'Henry', 'Virginia', 'Peter', 'Victoria', 'Zachary', 'Kelly', 'Douglas', 'Lauren', 'Arthur', 'Christina'
  ];

  var DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'proton.me', 'icloud.com', 'mail.com', 'fastmail.com'];

  btnGenerate.addEventListener('click', generate);
  btnCopy.addEventListener('click', copyOutput);

  function generate() {
    var count = parseInt(countEl.value) || 10;
    if (count < 1) count = 1;
    if (count > 500) count = 500;

    var type = typeEl.value;
    var sep = sepEl.value;
    if (sep === 'newline') sep = '\n';

    var items = [];
    for (var i = 0; i < count; i++) {
      switch (type) {
        case 'words':
          items.push(randomFrom(WORDS));
          break;
        case 'sentences':
          items.push(buildSentence());
          break;
        case 'names':
          items.push(randomFrom(NAMES));
          break;
        case 'numbers':
          items.push(String(Math.floor(Math.random() * 10000)));
          break;
        case 'emails':
          items.push(generateEmail());
          break;
        case 'uuids':
          items.push(generateUUID());
          break;
        default:
          items.push(randomFrom(WORDS));
      }
    }

    outputEl.value = items.join(sep);
    showToast('Generated ' + count + ' ' + type + '!', 'success');
  }

  function buildSentence() {
    var len = 5 + Math.floor(Math.random() * 8);
    var words = [];
    for (var i = 0; i < len; i++) {
      words.push(randomFrom(WORDS));
    }
    var sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  }

  function generateEmail() {
    var name = randomFrom(NAMES).toLowerCase();
    var num = Math.floor(Math.random() * 99);
    var domain = randomFrom(DOMAINS);
    return name + num + '@' + domain;
  }

  function generateUUID() {
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    // Set version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    // Set variant
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    var hex = [];
    for (var i = 0; i < 16; i++) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }
    return hex[0] + hex[1] + hex[2] + hex[3] + '-' +
           hex[4] + hex[5] + '-' +
           hex[6] + hex[7] + '-' +
           hex[8] + hex[9] + '-' +
           hex[10] + hex[11] + hex[12] + hex[13] + hex[14] + hex[15];
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function copyOutput() {
    var content = outputEl.value;
    if (!content) {
      showToast('Nothing to copy. Generate first!', 'error');
      return;
    }
    navigator.clipboard.writeText(content).then(function () {
      showToast('Copied to clipboard!', 'success');
    }).catch(function () {
      showToast('Copy failed.', 'error');
    });
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
