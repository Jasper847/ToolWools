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

  const ws = document.getElementById('tool-workspace');
  
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

  function render() {
    const r = calcResults();
    if (!r) return;

    ws.innerHTML = `
      <!-- Inputs -->
      <div class="ab-input-grid">
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-hours">Hours</label>
          <input type="number" id="ab-hours" class="tool-input" value="${hours}" min="0" max="99" style="font-size:18px;font-weight:700;text-align:center">
        </div>
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-minutes">Minutes</label>
          <input type="number" id="ab-minutes" class="tool-input" value="${minutes}" min="0" max="59" style="font-size:18px;font-weight:700;text-align:center">
        </div>
      </div>

      <!-- Speed Cards -->
      <div class="ab-input-label" style="margin-bottom:10px">Playback Speed</div>
      <div class="ab-speed-grid">
        ${SPEEDS.map(s => `
          <button class="ab-speed-card${s.value === speed ? ' active' : ''}" data-speed="${s.value}" aria-pressed="${s.value === speed}">
            <div class="ab-speed-value">${s.label}</div>
            ${s.tag ? '<div class="ab-speed-tag">' + s.tag + '</div>' : ''}
          </button>
        `).join('')}
      </div>

      <!-- Daily Listening Slider -->
      <div class="ab-input-label" style="margin-top:20px">Daily Listening Goal</div>
      <div class="ab-slider-row">
        <input type="range" id="ab-daily" min="0.5" max="8" step="0.5" value="${dailyHours}">
        <span class="ab-slider-value">${dailyHours}h/day</span>
      </div>

      <!-- Results -->
      <div class="ab-results-grid">
        <div class="ab-result-card">
          <div class="ab-result-value">${r.adjusted.h}h ${r.adjusted.m}m</div>
          <div class="ab-result-label">New Duration</div>
        </div>
        <div class="ab-result-card">
          <div class="ab-result-value">${r.saved.h}h ${r.saved.m}m</div>
          <div class="ab-result-label">Time Saved</div>
        </div>
        <div class="ab-result-card">
          <div class="ab-result-value">${r.pctSaved}%</div>
          <div class="ab-result-label">Faster</div>
        </div>
        <div class="ab-result-card">
          <div class="ab-result-value">${r.booksPerYear}</div>
          <div class="ab-result-label">Books / Year</div>
        </div>
      </div>

      <!-- Additional Stats -->
      <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap">
        <div class="tool-badge">📅 ${r.daysToFinish} day${r.daysToFinish !== 1 ? 's' : ''} to finish this book</div>
        <div class="tool-badge">🎧 ${r.original.h}h ${r.original.m}m original duration</div>
      </div>

      <!-- Speed Comparison Grid -->
      <h2 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin:32px 0 16px;color:var(--color-dark)">Speed Comparison</h2>
      <div class="ab-comparison-grid">
        ${r.allSpeeds.map(s => `
          <div class="ab-compare-col${s.value === speed ? ' active' : ''}">
            <div class="ab-compare-speed">${s.label}</div>
            <div class="ab-compare-time">${s.h}h ${s.m}m</div>
            <div class="ab-compare-saved">${s.pct > 0 ? '-' + s.pct + '%' : 'Baseline'}</div>
          </div>
        `).join('')}
      </div>

      <!-- FAQ -->
      <h2 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin:40px 0 16px;color:var(--color-dark)">Frequently Asked Questions</h2>
      <div class="ab-faq-list">
        ${FAQS.map((f, i) => `
          <div class="ab-faq-item" id="faq-${i}">
            <button class="ab-faq-q" aria-expanded="false" aria-controls="faq-a-${i}">${f.q}</button>
            <div class="ab-faq-a" id="faq-a-${i}" role="region">${f.a}</div>
          </div>
        `).join('')}
      </div>

      <!-- How It Works -->
      <section style="margin-top:48px;padding-top:32px;border-top:1px solid var(--color-border)">
        <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800;margin-bottom:8px;color:var(--color-dark)">How the Audiobook Speed Calculator Works</h2>
        <p style="font-size:15px;color:var(--color-muted);line-height:1.7;margin-bottom:24px">Our free calculator uses simple division — your audiobook's total runtime divided by your chosen speed multiplier — to deliver an instant, accurate result with no sign-up required.</p>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:32px">
          <div style="padding:20px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">
            <div style="font-size:13px;font-weight:800;color:var(--color-primary);margin-bottom:6px">STEP 1</div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:6px;color:var(--color-dark)">Enter the Original Duration</h3>
            <p style="font-size:13px;color:var(--color-muted);line-height:1.6">Find your audiobook's total runtime on Audible, Apple Books, Spotify, or Libby. Input the hours and minutes exactly as shown.</p>
          </div>
          <div style="padding:20px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">
            <div style="font-size:13px;font-weight:800;color:var(--color-primary);margin-bottom:6px">STEP 2</div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:6px;color:var(--color-dark)">Select Your Playback Speed</h3>
            <p style="font-size:13px;color:var(--color-muted);line-height:1.6">Choose from 1× (normal) up to 3× speed. The sweet spot for most new listeners is 1.25× or 1.5×. Power listeners often reach 2× within a few weeks.</p>
          </div>
          <div style="padding:20px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">
            <div style="font-size:13px;font-weight:800;color:var(--color-primary);margin-bottom:6px">STEP 3</div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:6px;color:var(--color-dark)">Set Your Daily Listening Goal</h3>
            <p style="font-size:13px;color:var(--color-muted);line-height:1.6">Drag the slider to match how many hours per day you realistically listen — commute time, workouts, or dedicated sessions all count.</p>
          </div>
          <div style="padding:20px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">
            <div style="font-size:13px;font-weight:800;color:var(--color-primary);margin-bottom:6px">STEP 4</div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:6px;color:var(--color-dark)">Read Your Instant Results</h3>
            <p style="font-size:13px;color:var(--color-muted);line-height:1.6">The calculator instantly shows your new listening time, time saved per session, days to finish at your daily goal, and projected books per year.</p>
          </div>
          <div style="padding:20px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">
            <div style="font-size:13px;font-weight:800;color:var(--color-primary);margin-bottom:6px">STEP 5</div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:6px;color:var(--color-dark)">Explore the Speed Comparison</h3>
            <p style="font-size:13px;color:var(--color-muted);line-height:1.6">The comparison grid shows every speed option side-by-side so you can see exactly how much time each level saves versus your baseline.</p>
          </div>
          <div style="padding:20px;border:1px solid var(--color-border);border-radius:14px;background:var(--color-surface)">
            <div style="font-size:13px;font-weight:800;color:var(--color-primary);margin-bottom:6px">STEP 6</div>
            <h3 style="font-size:15px;font-weight:700;margin-bottom:6px;color:var(--color-dark)">Plan Your Reading Goals</h3>
            <p style="font-size:13px;color:var(--color-muted);line-height:1.6">Use the books-per-year projection to set realistic annual reading goals and track how speed listening transforms your consumption habits.</p>
          </div>
        </div>
      </section>

      <!-- SEO Content Section -->
      <section style="margin-top:32px;padding-top:32px;border-top:1px solid var(--color-border)">
        <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:16px;color:var(--color-dark)">The Formula Behind the Calculator</h2>
        <p style="font-size:14px;color:var(--color-muted);line-height:1.8;margin-bottom:20px">The core calculation is straightforward: <strong style="color:var(--color-dark)">New Duration = Original Duration ÷ Speed</strong>. For example, a 10-hour audiobook at 1.5× speed takes 10 ÷ 1.5 = 6.67 hours (6h 40m). Time saved = 10 - 6.67 = 3.33 hours (3h 20m) per listen. At 2× speed, the same book finishes in exactly 5 hours — cutting your listening time in half.</p>
        
        <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:16px;color:var(--color-dark)">Does Listening Speed Affect Comprehension?</h2>
        <p style="font-size:14px;color:var(--color-muted);line-height:1.8;margin-bottom:20px">Research from the University of California and multiple cognitive science studies shows that comprehension loss is minimal at speeds up to 1.5× for most adult listeners. The brain's speech processing capacity far exceeds normal speaking rates. At 2×, comprehension depends heavily on familiarity with the topic — fiction and previously read material tolerate high speeds much better than complex non-fiction or language learning content.</p>
        
        <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:16px;color:var(--color-dark)">Which Apps Support Variable Playback Speed?</h2>
        <p style="font-size:14px;color:var(--color-muted);line-height:1.8;margin-bottom:20px">All major audiobook platforms support speed control: <strong style="color:var(--color-dark)">Audible</strong> supports 0.5× to 3.5×, <strong style="color:var(--color-dark)">Apple Books</strong> supports 0.5× to 2×, <strong style="color:var(--color-dark)">Spotify</strong> supports 0.5× to 3.5×, <strong style="color:var(--color-dark)">Libby/OverDrive</strong> supports up to 3×, and <strong style="color:var(--color-dark)">Speechify</strong> supports up to 4.5×.</p>
        
        <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:16px;color:var(--color-dark)">How to Train Yourself to Listen Faster</h2>
        <p style="font-size:14px;color:var(--color-muted);line-height:1.8;margin-bottom:20px">Start at 1.25× for one week, then increase by 0.25× increments every 7–14 days. Your brain adapts quickly through a process called perceptual learning — the same mechanism that lets you understand fast speakers in real conversation. Many listeners reach a comfortable 2× within 4–6 weeks. Taking brief notes immediately after each session dramatically improves retention at any speed.</p>
        
        <h2 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:16px;color:var(--color-dark)">How Many More Books Can You Read Per Year?</h2>
        <p style="font-size:14px;color:var(--color-muted);line-height:1.8">At 1.5× speed you can fit 50% more audiobooks into the same calendar time. At 2× you can theoretically double your annual reading list. The calculator's "Books/Year" stat uses your chosen speed and daily listening goal to show you exactly how many titles you can complete in a full year — a powerful motivator for building a consistent listening habit.</p>
      </section>
    `;

    // Wire events
    document.getElementById('ab-hours').addEventListener('input', e => { hours = Math.max(0, Math.min(99, parseInt(e.target.value) || 0)); render(); });
    document.getElementById('ab-minutes').addEventListener('input', e => { minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0)); render(); });
    document.getElementById('ab-daily').addEventListener('input', e => { dailyHours = parseFloat(e.target.value); document.querySelector('.ab-slider-value').textContent = dailyHours + 'h/day'; render(); });
    
    document.querySelectorAll('.ab-speed-card').forEach(card => {
      card.addEventListener('click', () => { speed = parseFloat(card.dataset.speed); render(); });
    });

    document.querySelectorAll('.ab-faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.ab-faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.ab-faq-item').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
        btn.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  render();
});
