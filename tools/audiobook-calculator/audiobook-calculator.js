document.addEventListener('DOMContentLoaded', () => {
  const SPEEDS = [
    { value: 1.0, label: '1×', tag: null },
    { value: 1.25, label: '1.25×', tag: 'Popular' },
    { value: 1.5, label: '1.5×', tag: 'Sweet Spot' },
    { value: 1.75, label: '1.75×', tag: null },
    { value: 2.0, label: '2×', tag: 'Power' },
    { value: 2.5, label: '2.5×', tag: null },
    { value: 3.0, label: '3×', tag: 'Max' },
  ];

  const FAQS = [
    { q: 'How does the Audiobook Speed Calculator work?', a: 'Enter the original runtime, select a speed from 1× to 3×, set your daily listening goal, and the calculator instantly shows your new duration, time saved, days to finish, and books per year — with no sign-up required.' },
    { q: 'What is the best audiobook speed for beginners?', a: 'Start at 1.25× for the first week, then move to 1.5× after you feel comfortable. The 1.25× to 1.5× range saves 20–33% of your listening time with minimal comprehension loss.' },
    { q: 'Can you really understand audiobooks at 2× speed?', a: 'Yes — with practice. Studies show comprehension loss is minimal up to 1.5× for most listeners. Above 2× depends on content complexity. Increase speed gradually by 0.25× per week.' },
    { q: 'How many books can I finish per year at 1.5× speed?', a: 'At 1.5× you can listen to 50% more books than at normal speed. If you previously finished 20 books per year, 1.5× would let you finish approximately 30.' },
    { q: 'Which audiobook apps support playback speed control?', a: 'Audible (0.5×–3.5×), Apple Books (0.5×–2×), Spotify (0.5×–3.5×), Libby/OverDrive (up to 3×), and Speechify (up to 4.5×) all support variable speed.' },
    { q: 'Does faster listening reduce memory retention?', a: 'Research shows minimal retention loss at speeds up to 1.5×. For complex non-fiction, staying at 1× or 1.25× is recommended. Taking notes after each session improves retention at any speed.' },
    { q: 'Is the Audiobook Speed Calculator free to use?', a: 'Yes, completely free. No account, no subscription, no data collection. All calculations happen in your browser — nothing is sent to any server.' },
  ];

  let hours = 10, minutes = 30, speed = 1.5, dailyHours = 2;

  // DOM Elements
  const hoursInput = document.getElementById('ab-hours');
  const minutesInput = document.getElementById('ab-minutes');
  const dailySlider = document.getElementById('ab-daily');
  const dailyHoursVal = document.getElementById('dailyHoursVal');

  const speedGrid = document.getElementById('speedGrid');
  const compareGrid = document.getElementById('compareGrid');
  const faqList = document.getElementById('faqList');

  const resDuration = document.getElementById('resDuration');
  const resSaved = document.getElementById('resSaved');
  const resFaster = document.getElementById('resFaster');
  const resBooks = document.getElementById('resBooks');

  const badgeDays = document.getElementById('badgeDays');
  const badgeOriginal = document.getElementById('badgeOriginal');

  function toHM(m) {
    return { h: Math.floor(m / 60), m: Math.round(m % 60) };
  }

  function calcResults() {
    const totalMins = hours * 60 + minutes;
    if (!totalMins) return null;
    const newMins = totalMins / speed;
    const savedMins = totalMins - newMins;
    const pctSaved = Math.round((savedMins / totalMins) * 100);
    const booksPerYear = parseFloat(((365 * dailyHours * 60) / newMins).toFixed(1));
    const daysToFinish = Math.ceil(newMins / (dailyHours * 60));
    return {
      totalMins, newMins, savedMins, pctSaved, booksPerYear, daysToFinish,
      original: toHM(totalMins),
      adjusted: toHM(newMins),
      saved: toHM(savedMins),
      allSpeeds: SPEEDS.map(s => {
        const m = totalMins / s.value;
        return { ...s, mins: m, ...toHM(m), saved: totalMins - m, pct: Math.round(((totalMins - m) / totalMins) * 100) };
      })
    };
  }

  // Render FAQs once (static data)
  function renderFAQs() {
    if (!faqList) return;
    faqList.innerHTML = FAQS.map((f, i) => `
      <div class="ab-faq-item" id="faq-${i}">
        <button class="ab-faq-q" aria-expanded="false" aria-controls="faq-a-${i}">${f.q}</button>
        <div class="ab-faq-a" id="faq-a-${i}" role="region">${f.a}</div>
      </div>
    `).join('');

    // Attach FAQ listeners
    faqList.querySelectorAll('.ab-faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.ab-faq-item');
        const isOpen = item.classList.contains('open');
        faqList.querySelectorAll('.ab-faq-item').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
        btn.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  function update() {
    const r = calcResults();
    if (!r) return;

    // Update simple outputs
    resDuration.textContent = `${r.adjusted.h}h ${r.adjusted.m}m`;
    resSaved.textContent = `${r.saved.h}h ${r.saved.m}m`;
    resFaster.textContent = `${r.pctSaved}%`;
    resBooks.textContent = `${r.booksPerYear}`;

    badgeDays.textContent = `📅 ${r.daysToFinish} day${r.daysToFinish !== 1 ? 's' : ''} to finish this book`;
    badgeOriginal.textContent = `🎧 ${r.original.h}h ${r.original.m}m original duration`;
    dailyHoursVal.textContent = `${dailyHours}h/day`;

    // Render speed pills grid
    speedGrid.innerHTML = SPEEDS.map(s => `
      <button class="ab-speed-card${s.value === speed ? ' active' : ''}" data-speed="${s.value}" aria-pressed="${s.value === speed}">
        <div class="ab-speed-value">${s.label}</div>
        ${s.tag ? '<div class="ab-speed-tag">' + s.tag + '</div>' : ''}
      </button>
    `).join('');

    // Reattach listeners to speed cards
    speedGrid.querySelectorAll('.ab-speed-card').forEach(card => {
      card.addEventListener('click', () => {
        speed = parseFloat(card.dataset.speed);
        update();
      });
    });

    // Render comparison table
    compareGrid.innerHTML = r.allSpeeds.map(s => `
      <div class="ab-compare-col${s.value === speed ? ' active' : ''}" style="cursor: pointer" data-speed="${s.value}">
        <div class="ab-compare-speed">${s.label}</div>
        <div class="ab-compare-time">${s.h}h ${s.m}m</div>
        <div class="ab-compare-saved">${s.pct > 0 ? '-' + s.pct + '%' : 'Baseline'}</div>
      </div>
    `).join('');

    // Reattach listeners to comparison columns
    compareGrid.querySelectorAll('.ab-compare-col').forEach(col => {
      col.addEventListener('click', () => {
        speed = parseFloat(col.dataset.speed);
        update();
      });
    });
  }

  // Event Listeners
  if (hoursInput) {
    hoursInput.addEventListener('input', e => {
      hours = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
      update();
    });
  }
  if (minutesInput) {
    minutesInput.addEventListener('input', e => {
      minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
      update();
    });
  }
  if (dailySlider) {
    dailySlider.addEventListener('input', e => {
      dailyHours = parseFloat(e.target.value);
      update();
    });
  }

  // Initialize
  renderFAQs();
  update();
});
