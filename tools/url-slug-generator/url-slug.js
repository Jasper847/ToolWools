document.addEventListener('DOMContentLoaded', function () {
  var inputEl = document.getElementById('input');
  var domainEl = document.getElementById('domain');
  var maxLenEl = document.getElementById('max-len');
  var optStopEl = document.getElementById('opt-stop');
  var btnGenerate = document.getElementById('btn-generate');
  var btnCopy = document.getElementById('btn-copy');
  var urlPreview = document.getElementById('url-preview');
  var slugStats = document.getElementById('slug-stats');

  // English stop words
  var STOP_WORDS = [
    'the', 'a', 'an', 'is', 'at', 'by', 'for', 'in', 'of', 'on', 'to',
    'and', 'or', 'but', 'nor', 'not', 'so', 'yet', 'with', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because',
    'about', 'up', 'its', 'it', 'this', 'that', 'these', 'those',
    'am', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom'
  ];

  // Unicode transliteration map (common accented characters)
  var TRANSLITERATE_MAP = {
    '\u00E0': 'a', '\u00E1': 'a', '\u00E2': 'a', '\u00E3': 'a', '\u00E4': 'a', '\u00E5': 'a',
    '\u00E6': 'ae', '\u00E7': 'c', '\u00E8': 'e', '\u00E9': 'e', '\u00EA': 'e', '\u00EB': 'e',
    '\u00EC': 'i', '\u00ED': 'i', '\u00EE': 'i', '\u00EF': 'i',
    '\u00F0': 'd', '\u00F1': 'n', '\u00F2': 'o', '\u00F3': 'o', '\u00F4': 'o', '\u00F5': 'o',
    '\u00F6': 'o', '\u00F8': 'o', '\u00F9': 'u', '\u00FA': 'u', '\u00FB': 'u', '\u00FC': 'u',
    '\u00FD': 'y', '\u00FF': 'y', '\u00FE': 'th',
    '\u00C0': 'A', '\u00C1': 'A', '\u00C2': 'A', '\u00C3': 'A', '\u00C4': 'A', '\u00C5': 'A',
    '\u00C6': 'AE', '\u00C7': 'C', '\u00C8': 'E', '\u00C9': 'E', '\u00CA': 'E', '\u00CB': 'E',
    '\u00CC': 'I', '\u00CD': 'I', '\u00CE': 'I', '\u00CF': 'I',
    '\u00D0': 'D', '\u00D1': 'N', '\u00D2': 'O', '\u00D3': 'O', '\u00D4': 'O', '\u00D5': 'O',
    '\u00D6': 'O', '\u00D8': 'O', '\u00D9': 'U', '\u00DA': 'U', '\u00DB': 'U', '\u00DC': 'U',
    '\u00DD': 'Y',
    '\u0100': 'A', '\u0101': 'a', '\u0102': 'A', '\u0103': 'a',
    '\u0104': 'A', '\u0105': 'a', '\u0106': 'C', '\u0107': 'c',
    '\u010C': 'C', '\u010D': 'c', '\u010E': 'D', '\u010F': 'd',
    '\u0110': 'D', '\u0111': 'd', '\u0112': 'E', '\u0113': 'e',
    '\u0116': 'E', '\u0117': 'e', '\u0118': 'E', '\u0119': 'e',
    '\u011A': 'E', '\u011B': 'e', '\u011E': 'G', '\u011F': 'g',
    '\u0130': 'I', '\u0131': 'i', '\u0141': 'L', '\u0142': 'l',
    '\u0143': 'N', '\u0144': 'n', '\u0147': 'N', '\u0148': 'n',
    '\u014C': 'O', '\u014D': 'o', '\u0150': 'O', '\u0151': 'o',
    '\u0152': 'OE', '\u0153': 'oe', '\u0158': 'R', '\u0159': 'r',
    '\u015A': 'S', '\u015B': 's', '\u015E': 'S', '\u015F': 's',
    '\u0160': 'S', '\u0161': 's', '\u0162': 'T', '\u0163': 't',
    '\u0164': 'T', '\u0165': 't', '\u016E': 'U', '\u016F': 'u',
    '\u0170': 'U', '\u0171': 'u', '\u0172': 'U', '\u0173': 'u',
    '\u0178': 'Y', '\u0179': 'Z', '\u017A': 'z', '\u017B': 'Z',
    '\u017C': 'z', '\u017D': 'Z', '\u017E': 'z',
    '\u00DF': 'ss', '\u00D7': 'x', '\u00F7': '-'
  };

  // Auto-update on input
  inputEl.addEventListener('input', generateSlug);
  domainEl.addEventListener('input', generateSlug);
  maxLenEl.addEventListener('input', generateSlug);
  optStopEl.addEventListener('change', generateSlug);
  btnGenerate.addEventListener('click', generateSlug);
  btnCopy.addEventListener('click', copyURL);

  function transliterate(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      result += TRANSLITERATE_MAP[ch] || ch;
    }
    return result;
  }

  function generateSlug() {
    var text = inputEl.value.trim();
    if (!text) {
      urlPreview.textContent = getDomain() + '/your-slug-here';
      slugStats.textContent = '';
      slugStats.style.display = 'none';
      return;
    }

    // Transliterate unicode accents
    var slug = transliterate(text);

    // Lowercase
    slug = slug.toLowerCase();

    // Remove stop words if enabled
    if (optStopEl.checked) {
      var words = slug.split(/\s+/);
      words = words.filter(function (word) {
        var cleanWord = word.replace(/[^a-z0-9]/g, '');
        return STOP_WORDS.indexOf(cleanWord) === -1;
      });
      // Don't filter if all words would be removed
      if (words.length === 0) {
        words = slug.split(/\s+/);
      }
      slug = words.join(' ');
    }

    // Replace non-alphanumeric with hyphens
    slug = slug.replace(/[^a-z0-9]+/g, '-');

    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');

    // Enforce max length
    var maxLen = parseInt(maxLenEl.value) || 60;
    if (maxLen < 10) maxLen = 10;
    if (slug.length > maxLen) {
      slug = slug.substring(0, maxLen);
      // Don't end with a hyphen
      slug = slug.replace(/-+$/, '');
    }

    var domain = getDomain();
    var fullURL = domain + '/' + slug;

    urlPreview.textContent = fullURL;
    slugStats.textContent = 'Slug: ' + slug.length + ' chars | Full URL: ' + fullURL.length + ' chars';
    slugStats.style.display = 'inline-block';
  }

  function getDomain() {
    var domain = domainEl.value.trim();
    if (!domain) domain = 'https://example.com';
    // Remove trailing slash
    domain = domain.replace(/\/+$/, '');
    return domain;
  }

  function copyURL() {
    var url = urlPreview.textContent;
    if (!url || url.indexOf('your-slug-here') !== -1) {
      showToast('Generate a slug first!', 'error');
      return;
    }
    navigator.clipboard.writeText(url).then(function () {
      showToast('URL copied to clipboard!', 'success');
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
