document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('editor-textarea');

  // Stats display
  const statWords = document.getElementById('stat-words');
  const statCharsSpace = document.getElementById('stat-chars-space');
  const statCharsNoSpace = document.getElementById('stat-chars-no-space');
  const statSentences = document.getElementById('stat-sentences');
  const statParagraphs = document.getElementById('stat-paragraphs');

  // Timers
  const timeReading = document.getElementById('time-reading');
  const timeSpeaking = document.getElementById('time-speaking');

  // Density table body
  const densityTableBody = document.getElementById('density-table-body');

  // Action buttons
  const btnCaseUpper = document.getElementById('btn-case-upper');
  const btnCaseLower = document.getElementById('btn-case-lower');
  const btnCaseTitle = document.getElementById('btn-case-title');
  const btnCaseSentence = document.getElementById('btn-case-sentence');
  const btnEditorCopy = document.getElementById('btn-editor-copy');
  const btnEditorClear = document.getElementById('btn-editor-clear');

  // Toast
  const copyToast = document.getElementById('copy-toast');
  const toastMessage = document.getElementById('toast-message');

  // Stop words set for Keyword Density
  const stopWords = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot',
    'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during',
    'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having',
    'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows',
    'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more',
    'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
    'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should',
    'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves',
    'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through',
    'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
    'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys',
    'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  // Helper: Format Time Duration
  function formatDuration(seconds) {
    if (seconds === 0) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  // Core Word Counter Analysis
  function performAnalysis() {
    const text = textarea.value;

    // 1. Chars count (with space)
    const charsWithSpace = text.length;
    statCharsSpace.textContent = charsWithSpace;

    // 2. Chars count (no space)
    const charsNoSpace = text.replace(/\s/g, '').length;
    statCharsNoSpace.textContent = charsNoSpace;

    // 3. Words count
    const wordsArray = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = wordsArray.length;
    statWords.textContent = wordCount;

    // 4. Sentence count
    // Matches ending punctuations (. ! ?) followed by space or end of string
    const sentenceCount = text.trim() === '' ? 0 : text.split(/[.!?]+(?:\s+|$)/).filter(s => s.trim().length > 0).length;
    statSentences.textContent = sentenceCount;

    // 5. Paragraph count
    // Matches double or single newlines
    const paragraphCount = text.trim() === '' ? 0 : text.split(/\n+/).filter(p => p.trim().length > 0).length;
    statParagraphs.textContent = paragraphCount;

    // 6. Time Estimates
    // Reading Time (225 wpm)
    const readingTimeSec = (wordCount / 225) * 60;
    timeReading.textContent = formatDuration(readingTimeSec);

    // Speaking Time (130 wpm)
    const speakingTimeSec = (wordCount / 130) * 60;
    timeSpeaking.textContent = formatDuration(speakingTimeSec);

    // 7. Keyword Density Analysis
    updateKeywordDensity(wordsArray);
  }

  // Keyword Density Logic
  function updateKeywordDensity(wordsArray) {
    if (wordsArray.length === 0) {
      densityTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--color-muted); padding: 30px;">
            Enter text in the editor above to view keyword densities.
          </td>
        </tr>`;
      return;
    }

    const frequencies = {};
    let totalFilteredWords = 0;

    wordsArray.forEach(rawWord => {
      // Clean word: lower case and strip punctuation
      const cleanWord = rawWord.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();

      if (cleanWord && !stopWords.has(cleanWord) && isNaN(cleanWord)) {
        frequencies[cleanWord] = (frequencies[cleanWord] || 0) + 1;
        totalFilteredWords++;
      }
    });

    // Convert to sorted array
    const sortedKeywords = Object.keys(frequencies)
      .map(word => ({
        word: word,
        count: frequencies[word],
        percentage: ((frequencies[word] / wordsArray.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    if (sortedKeywords.length === 0) {
      densityTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; color: var(--color-muted); padding: 30px;">
            No significant keywords found (all entered words are stop-words or symbols).
          </td>
        </tr>`;
      return;
    }

    // Render table
    let tableHtml = '';
    sortedKeywords.forEach(item => {
      tableHtml += `
        <tr>
          <td class="density-word">${item.word}</td>
          <td>${item.count}</td>
          <td>
            <div class="density-progress-container">
              <div class="density-progress-bar">
                <div class="density-progress-fill" style="width: ${item.percentage}%;"></div>
              </div>
              <span class="density-percent">${item.percentage}%</span>
            </div>
          </td>
        </tr>`;
    });

    densityTableBody.innerHTML = tableHtml;
  }

  // --- CASE CONVERSION ACTIONS ---

  // UPPERCASE
  btnCaseUpper.addEventListener('click', () => {
    const text = textarea.value;
    textarea.value = text.toUpperCase();
    performAnalysis();
  });

  // lowercase
  btnCaseLower.addEventListener('click', () => {
    const text = textarea.value;
    textarea.value = text.toLowerCase();
    performAnalysis();
  });

  // Title Case
  btnCaseTitle.addEventListener('click', () => {
    const text = textarea.value;
    // Capitalize every word
    textarea.value = text.replace(/\b\w+/g, word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    performAnalysis();
  });

  // Sentence Case
  btnCaseSentence.addEventListener('click', () => {
    const text = textarea.value;
    // Lowercase everything first, then capitalize first letter of each sentence
    textarea.value = text.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (match, separator, char) => {
      return separator + char.toUpperCase();
    });
    performAnalysis();
  });

  // --- GENERAL ACTIONS ---

  // Copy Text
  btnEditorCopy.addEventListener('click', () => {
    if (textarea.value.trim() === '') return;

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(textarea.value).then(() => {
      toastMessage.textContent = 'Text copied to clipboard!';
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  });

  // Clear
  btnEditorClear.addEventListener('click', () => {
    textarea.value = '';
    performAnalysis();
  });

  // Live trigger
  textarea.addEventListener('input', performAnalysis);

  // Initial trigger
  performAnalysis();
});
