document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const chartSection = document.getElementById("chart-section");
  const chartBars = document.getElementById("chart-bars");
  const btnClear = document.getElementById("btn-clear");

  const statLetters = document.getElementById("stat-letters");
  const statVowels = document.getElementById("stat-vowels");
  const statConsonants = document.getElementById("stat-consonants");
  const statDigits = document.getElementById("stat-digits");
  const statSpaces = document.getElementById("stat-spaces");

  function analyzeText() {
    const text = input.value;

    if (!text) {
      statLetters.textContent = "0";
      statVowels.textContent = "0";
      statConsonants.textContent = "0";
      statDigits.textContent = "0";
      statSpaces.textContent = "0";
      chartSection.style.display = "none";
      return;
    }

    // Counters
    const vowelsMatch = text.match(/[aeiou]/gi) || [];
    const consonantsMatch = text.match(/[bcdfghjklmnpqrstvwxyz]/gi) || [];
    const digitsMatch = text.match(/[0-9]/g) || [];
    const spacesMatch = text.match(/\s/g) || [];

    const vowelsCount = vowelsMatch.length;
    const consonantsCount = consonantsMatch.length;
    const lettersCount = vowelsCount + consonantsCount;

    statLetters.textContent = lettersCount;
    statVowels.textContent = vowelsCount;
    statConsonants.textContent = consonantsCount;
    statDigits.textContent = digitsMatch.length;
    statSpaces.textContent = spacesMatch.length;

    // Frequencies (A-Z)
    const freqs = {};
    let maxFreq = 0;

    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i); // 'A' to 'Z'
      freqs[char] = 0;
    }

    for (let char of text.toUpperCase()) {
      if (char >= "A" && char <= "Z") {
        freqs[char]++;
        if (freqs[char] > maxFreq) {
          maxFreq = freqs[char];
        }
      }
    }

    // Render Bars
    chartBars.innerHTML = "";
    let hasLetters = false;

    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i);
      const count = freqs[char];
      if (count > 0) hasLetters = true;

      const percent = maxFreq > 0 ? (count / maxFreq) * 100 : 0;

      const row = document.createElement("div");
      row.className = "frequency-bar-row";
      row.innerHTML = `
        <span class="frequency-letter-label">${char}</span>
        <div class="frequency-bar-bg">
          <div class="frequency-bar-fill" style="width: ${percent}%"></div>
        </div>
        <span class="frequency-val-label">${count}</span>
      `;
      chartBars.appendChild(row);
    }

    if (hasLetters) {
      chartSection.style.display = "block";
    } else {
      chartSection.style.display = "none";
    }
  }

  input.addEventListener("input", analyzeText);
  btnClear.addEventListener("click", () => {
    input.value = "";
    analyzeText();
    showToast("Cleared text analysis.", "info");
  });

  // Run analysis on load in case of browser auto-fill
  analyzeText();
});
