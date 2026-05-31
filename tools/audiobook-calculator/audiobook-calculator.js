/* =============================================
   TOOLWOOLS — Audiobook Speed Calculator v2
   The #1 Audiobook Calculator — 4 Modes:
   1. Speed Calculator (core)
   2. Word Count → Duration
   3. Progress / Percentage Tracker
   4. Finish-By Deadline Planner
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {

  // === CONSTANTS ===
  const SPEEDS = [
    { value: 1.0, label: '1×', tag: null },
    { value: 1.25, label: '1.25×', tag: 'Popular' },
    { value: 1.5, label: '1.5×', tag: 'Sweet Spot' },
    { value: 1.75, label: '1.75×', tag: null },
    { value: 2.0, label: '2×', tag: 'Power' },
    { value: 2.5, label: '2.5×', tag: null },
    { value: 3.0, label: '3×', tag: 'Max' },
  ];

  const POPULAR_BOOKS = [
    { title: 'Atomic Habits — James Clear', hours: 5, minutes: 35 },
    { title: 'The Psychology of Money — Morgan Housel', hours: 5, minutes: 48 },
    { title: 'Project Hail Mary — Andy Weir', hours: 16, minutes: 10 },
    { title: 'A Court of Thorns and Roses — Sarah J. Maas', hours: 11, minutes: 24 },
    { title: 'The 48 Laws of Power — Robert Greene', hours: 23, minutes: 6 },
    { title: 'Educated — Tara Westover', hours: 12, minutes: 10 },
    { title: 'Sapiens — Yuval Noah Harari', hours: 15, minutes: 17 },
    { title: 'The Subtle Art of Not Giving a F*ck — Mark Manson', hours: 5, minutes: 17 },
    { title: 'Dune — Frank Herbert', hours: 21, minutes: 2 },
    { title: 'Harry Potter (Complete Series)', hours: 117, minutes: 0 },
    { title: 'The Lord of the Rings (Complete)', hours: 54, minutes: 0 },
    { title: 'Becoming — Michelle Obama', hours: 19, minutes: 3 },
    { title: 'Can\'t Hurt Me — David Goggins', hours: 13, minutes: 37 },
    { title: 'The Alchemist — Paulo Coelho', hours: 4, minutes: 0 },
    { title: 'Thinking, Fast and Slow — Daniel Kahneman', hours: 20, minutes: 28 },
    { title: '12 Rules for Life — Jordan Peterson', hours: 15, minutes: 40 },
    { title: 'Where the Crawdads Sing — Delia Owens', hours: 12, minutes: 12 },
    { title: 'The Great Gatsby — F. Scott Fitzgerald', hours: 4, minutes: 49 },
    { title: 'It Ends With Us — Colleen Hoover', hours: 9, minutes: 30 },
    { title: 'Rich Dad Poor Dad — Robert Kiyosaki', hours: 6, minutes: 9 },
  ];

  // === STATE ===
  let hours = 10, minutes = 30, speed = 1.5, dailyHours = 2;
  let customSpeed = '';
  let activeTab = 'speed';

  // === DOM ===
  const ws = document.getElementById('tool-workspace');

  function toHM(m) { return { h: Math.floor(m / 60), m: Math.round(m % 60) }; }
  function fmtHM(hm) { return `${hm.h}h ${hm.m}m`; }

  function getEffectiveSpeed() {
    if (customSpeed && !isNaN(parseFloat(customSpeed)) && parseFloat(customSpeed) > 0) {
      return parseFloat(customSpeed);
    }
    return speed;
  }


  // === RENDER MAIN UI ===
  function render() {
    const s = getEffectiveSpeed();
    const totalMins = hours * 60 + minutes;

    ws.innerHTML = `
      <!-- Calculator Tabs -->
      <div class="ab-tabs" role="tablist" aria-label="Calculator modes">
        <button class="ab-tab ${activeTab === 'speed' ? 'active' : ''}" data-tab="speed" role="tab" aria-selected="${activeTab === 'speed'}">⚡ Speed Calculator</button>
        <button class="ab-tab ${activeTab === 'wordcount' ? 'active' : ''}" data-tab="wordcount" role="tab" aria-selected="${activeTab === 'wordcount'}">📖 Word Count</button>
        <button class="ab-tab ${activeTab === 'progress' ? 'active' : ''}" data-tab="progress" role="tab" aria-selected="${activeTab === 'progress'}">📊 Progress Tracker</button>
        <button class="ab-tab ${activeTab === 'deadline' ? 'active' : ''}" data-tab="deadline" role="tab" aria-selected="${activeTab === 'deadline'}">🎯 Finish By</button>
      </div>

      <!-- Tab Content -->
      <div class="ab-tab-content">
        ${activeTab === 'speed' ? renderSpeedTab(totalMins, s) : ''}
        ${activeTab === 'wordcount' ? renderWordCountTab() : ''}
        ${activeTab === 'progress' ? renderProgressTab() : ''}
        ${activeTab === 'deadline' ? renderDeadlineTab() : ''}
      </div>
    `;

    wireEvents();
  }


  // === TAB 1: SPEED CALCULATOR ===
  function renderSpeedTab(totalMins, s) {
    const newMins = totalMins / s;
    const savedMins = totalMins - newMins;
    const pctSaved = totalMins > 0 ? Math.round((savedMins / totalMins) * 100) : 0;
    const booksPerYear = totalMins > 0 ? parseFloat(((365 * dailyHours * 60) / newMins).toFixed(1)) : 0;
    const daysToFinish = totalMins > 0 ? Math.ceil(newMins / (dailyHours * 60)) : 0;
    const wpm = Math.round(150 * s);
    const adjusted = toHM(newMins);
    const saved = toHM(savedMins);

    return `
      <!-- Popular Book Presets -->
      <div class="ab-input-group" style="margin-bottom:16px">
        <label class="ab-input-label">Quick Select Popular Audiobook</label>
        <select id="ab-presets" class="tool-select" style="width:100%">
          <option value="">— Select a book or enter custom duration below —</option>
          ${POPULAR_BOOKS.map(b => `<option value="${b.hours}:${b.minutes}" ${hours===b.hours && minutes===b.minutes ? 'selected' : ''}>${b.title} (${b.hours}h ${b.minutes}m)</option>`).join('')}
        </select>
      </div>

      <!-- Duration Input -->
      <div class="ab-input-grid">
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-hours">Hours</label>
          <input type="number" id="ab-hours" class="tool-input" value="${hours}" min="0" max="200" style="font-size:20px;font-weight:700;text-align:center">
        </div>
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-minutes">Minutes</label>
          <input type="number" id="ab-minutes" class="tool-input" value="${minutes}" min="0" max="59" style="font-size:20px;font-weight:700;text-align:center">
        </div>
      </div>

      <!-- Speed Selection -->
      <label class="ab-input-label" style="margin:20px 0 10px;display:block">Choose Your Playback Speed</label>
      <div class="ab-speed-grid">
        ${SPEEDS.map(sp => `
          <button class="ab-speed-card${sp.value === speed && !customSpeed ? ' active' : ''}" data-speed="${sp.value}">
            <div class="ab-speed-value">${sp.label}</div>
            ${sp.tag ? '<div class="ab-speed-tag">' + sp.tag + '</div>' : ''}
          </button>
        `).join('')}
      </div>

      <!-- Custom Speed -->
      <div class="ab-slider-row" style="margin-top:12px">
        <label class="ab-input-label" style="white-space:nowrap">Custom speed:</label>
        <input type="number" id="ab-custom-speed" class="tool-input" value="${customSpeed}" min="0.5" max="5" step="0.05" placeholder="e.g. 1.35" style="width:100px;text-align:center">
        <span style="font-size:13px;color:var(--color-muted)">× (0.5–5.0)</span>
      </div>

      <!-- Daily Listening Goal -->
      <label class="ab-input-label" style="margin-top:20px;display:block">How Many Hours Do You Listen Daily?</label>
      <div class="ab-slider-row">
        <input type="range" id="ab-daily" min="0.5" max="8" step="0.5" value="${dailyHours}">
        <span class="ab-slider-value">${dailyHours}h/day</span>
      </div>

      <!-- Results Dashboard -->
      <div class="ab-results-grid">
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(adjusted)}</div><div class="ab-result-label">Your Adjusted Time</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(saved)}</div><div class="ab-result-label">Time You'll Save</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${pctSaved}%</div><div class="ab-result-label">Speed Increase</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${booksPerYear}</div><div class="ab-result-label">Books Per Year</div></div>
      </div>

      <!-- Extra Stats -->
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0">
        <span class="tool-badge">Finish in ${daysToFinish} day${daysToFinish!==1?'s':''} at ${dailyHours}h/day</span>
        <span class="tool-badge">Original: ${hours}h ${minutes}m</span>
        <span class="tool-badge">Effective: ${wpm} words/min</span>
      </div>

      <!-- Speed Comparison Grid -->
      <h3 style="font-family:var(--font-display);font-size:17px;font-weight:700;margin:28px 0 12px;color:var(--color-dark)">See how every speed affects this audiobook:</h3>
      <div class="ab-comparison-grid">
        ${SPEEDS.map(sp => {
          const m = totalMins / sp.value;
          const hm = toHM(m);
          const pct = totalMins > 0 ? Math.round(((totalMins - m) / totalMins) * 100) : 0;
          return `<div class="ab-compare-col${sp.value === s ? ' active' : ''}" data-speed="${sp.value}" style="cursor:pointer">
            <div class="ab-compare-speed">${sp.label}</div>
            <div class="ab-compare-time">${hm.h}h ${hm.m}m</div>
            <div class="ab-compare-saved">${pct > 0 ? '-' + pct + '%' : 'Normal'}</div>
            <div style="font-size:10px;color:var(--color-muted);margin-top:4px">${Math.round(150 * sp.value)} WPM</div>
          </div>`;
        }).join('')}
      </div>
    `;
  }


  // === TAB 2: WORD COUNT → DURATION ===
  function renderWordCountTab() {
    return `
      <div class="ab-input-group" style="margin-bottom:16px">
        <label class="ab-input-label" for="ab-wordcount">Total Word Count of Your Book</label>
        <input type="number" id="ab-wordcount" class="tool-input" value="80000" min="1000" max="500000" placeholder="e.g. 80000" style="font-size:18px;font-weight:700;text-align:center">
      </div>
      <div class="ab-input-group" style="margin-bottom:16px">
        <label class="ab-input-label" for="ab-narration-speed">Narration Speed (words per minute)</label>
        <div class="ab-slider-row">
          <input type="range" id="ab-narration-speed" min="120" max="180" step="5" value="150">
          <span class="ab-slider-value" id="ab-narration-val">150 WPM</span>
        </div>
        <p style="font-size:12px;color:var(--color-muted);margin-top:4px">Average: 150 WPM · Slow narrators: 120–130 · Fast narrators: 165–180</p>
      </div>
      <div id="wc-results"></div>
    `;
  }

  function calcWordCount() {
    const wordcount = parseInt(document.getElementById('ab-wordcount')?.value) || 80000;
    const narrationWPM = parseInt(document.getElementById('ab-narration-speed')?.value) || 150;
    const totalMins = wordcount / narrationWPM;
    const hm = toHM(totalMins);
    const el = document.getElementById('wc-results');
    if (!el) return;

    el.innerHTML = `
      <div class="ab-results-grid">
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(hm)}</div><div class="ab-result-label">Estimated Runtime</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(toHM(totalMins / 1.5))}</div><div class="ab-result-label">At 1.5× Speed</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(toHM(totalMins / 2))}</div><div class="ab-result-label">At 2× Speed</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${Math.round(wordcount / 275)}</div><div class="ab-result-label">~Pages (Paperback)</div></div>
      </div>
      <p style="font-size:13px;color:var(--color-muted);margin-top:12px;line-height:1.6">A ${wordcount.toLocaleString()}-word book narrated at ${narrationWPM} words per minute produces an audiobook of approximately <strong style="color:var(--color-dark)">${hm.h} hours and ${hm.m} minutes</strong>. At 1.5× speed, you'd finish in ${fmtHM(toHM(totalMins/1.5))} — saving ${fmtHM(toHM(totalMins - totalMins/1.5))} of listening time.</p>
    `;
    document.getElementById('ab-narration-val').textContent = narrationWPM + ' WPM';
  }

  // === TAB 3: PROGRESS TRACKER ===
  function renderProgressTab() {
    return `
      <div class="ab-input-grid">
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-total-h">Total Duration (hours)</label>
          <input type="number" id="ab-total-h" class="tool-input" value="12" min="0" max="200" style="text-align:center">
        </div>
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-total-m">Total Duration (minutes)</label>
          <input type="number" id="ab-total-m" class="tool-input" value="30" min="0" max="59" style="text-align:center">
        </div>
      </div>
      <div class="ab-input-grid" style="margin-top:12px">
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-current-h">Current Position (hours)</label>
          <input type="number" id="ab-current-h" class="tool-input" value="4" min="0" max="200" style="text-align:center">
        </div>
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-current-m">Current Position (minutes)</label>
          <input type="number" id="ab-current-m" class="tool-input" value="15" min="0" max="59" style="text-align:center">
        </div>
      </div>
      <div class="ab-input-group" style="margin-top:12px">
        <label class="ab-input-label">Listening Speed</label>
        <div class="ab-slider-row">
          <input type="range" id="ab-prog-speed" min="1" max="3" step="0.25" value="1.5">
          <span class="ab-slider-value" id="ab-prog-speed-val">1.5×</span>
        </div>
      </div>
      <div id="progress-results" style="margin-top:16px"></div>
    `;
  }

  function calcProgress() {
    const totalH = parseInt(document.getElementById('ab-total-h')?.value) || 0;
    const totalM = parseInt(document.getElementById('ab-total-m')?.value) || 0;
    const curH = parseInt(document.getElementById('ab-current-h')?.value) || 0;
    const curM = parseInt(document.getElementById('ab-current-m')?.value) || 0;
    const spd = parseFloat(document.getElementById('ab-prog-speed')?.value) || 1;
    const total = totalH * 60 + totalM;
    const current = curH * 60 + curM;
    if (total <= 0) return;
    const pct = Math.min(100, Math.round((current / total) * 100));
    const remaining = Math.max(0, total - current);
    const remainingAtSpeed = remaining / spd;
    const el = document.getElementById('progress-results');
    if (!el) return;

    document.getElementById('ab-prog-speed-val').textContent = spd + '×';

    el.innerHTML = `
      <div style="background:var(--color-border);border-radius:8px;height:12px;overflow:hidden;margin-bottom:16px">
        <div style="background:var(--color-primary);height:100%;width:${pct}%;border-radius:8px;transition:width .3s ease"></div>
      </div>
      <div class="ab-results-grid">
        <div class="ab-result-card"><div class="ab-result-value">${pct}%</div><div class="ab-result-label">Completed</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(toHM(remaining))}</div><div class="ab-result-label">Time Remaining</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(toHM(remainingAtSpeed))}</div><div class="ab-result-label">At ${spd}× Speed</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${100 - pct}%</div><div class="ab-result-label">Left to Go</div></div>
      </div>
    `;
  }

  // === TAB 4: FINISH-BY DEADLINE ===
  function renderDeadlineTab() {
    const today = new Date().toISOString().split('T')[0];
    return `
      <div class="ab-input-grid">
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-rem-h">Remaining Time (hours)</label>
          <input type="number" id="ab-rem-h" class="tool-input" value="8" min="0" max="200" style="text-align:center">
        </div>
        <div class="ab-input-group">
          <label class="ab-input-label" for="ab-rem-m">Remaining Time (minutes)</label>
          <input type="number" id="ab-rem-m" class="tool-input" value="0" min="0" max="59" style="text-align:center">
        </div>
      </div>
      <div class="ab-input-group" style="margin-top:12px">
        <label class="ab-input-label" for="ab-deadline">I want to finish by:</label>
        <input type="date" id="ab-deadline" class="tool-input" value="${getDateInDays(7)}" min="${today}" style="font-size:16px">
      </div>
      <div class="ab-input-group" style="margin-top:12px">
        <label class="ab-input-label">Playback Speed</label>
        <div class="ab-slider-row">
          <input type="range" id="ab-dl-speed" min="1" max="3" step="0.25" value="1.5">
          <span class="ab-slider-value" id="ab-dl-speed-val">1.5×</span>
        </div>
      </div>
      <div id="deadline-results" style="margin-top:16px"></div>
    `;
  }

  function getDateInDays(n) {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().split('T')[0];
  }

  function calcDeadline() {
    const remH = parseInt(document.getElementById('ab-rem-h')?.value) || 0;
    const remM = parseInt(document.getElementById('ab-rem-m')?.value) || 0;
    const deadline = document.getElementById('ab-deadline')?.value;
    const spd = parseFloat(document.getElementById('ab-dl-speed')?.value) || 1;
    const remaining = (remH * 60 + remM) / spd;
    if (!deadline || remaining <= 0) return;

    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(deadline); target.setHours(0,0,0,0);
    const daysLeft = Math.max(1, Math.ceil((target - today) / (1000*60*60*24)));
    const dailyNeeded = remaining / daysLeft;
    const dailyHM = toHM(dailyNeeded);

    document.getElementById('ab-dl-speed-val').textContent = spd + '×';
    const el = document.getElementById('deadline-results');
    if (!el) return;

    el.innerHTML = `
      <div class="ab-results-grid">
        <div class="ab-result-card"><div class="ab-result-value">${daysLeft}</div><div class="ab-result-label">Days Until Deadline</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(dailyHM)}</div><div class="ab-result-label">Listen Daily (at ${spd}×)</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(toHM(remaining))}</div><div class="ab-result-label">Adjusted Remaining</div></div>
        <div class="ab-result-card"><div class="ab-result-value">${fmtHM(toHM(remH*60+remM))}</div><div class="ab-result-label">Original Remaining</div></div>
      </div>
      <p style="font-size:14px;color:var(--color-muted);margin-top:12px;line-height:1.6">To finish your audiobook by <strong style="color:var(--color-dark)">${target.toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'})}</strong>, you need to listen for <strong style="color:var(--color-primary)">${fmtHM(dailyHM)}</strong> per day at ${spd}× speed. That's ${daysLeft} listening sessions to complete ${fmtHM(toHM(remaining))} of adjusted audio.</p>
    `;
  }


  // === EVENT WIRING ===
  function wireEvents() {
    // Tab switching
    document.querySelectorAll('.ab-tab').forEach(tab => {
      tab.addEventListener('click', () => { activeTab = tab.dataset.tab; render(); });
    });

    if (activeTab === 'speed') {
      // Preset selector
      document.getElementById('ab-presets')?.addEventListener('change', e => {
        if (e.target.value) {
          const [h, m] = e.target.value.split(':').map(Number);
          hours = h; minutes = m; render();
        }
      });
      // Duration inputs
      document.getElementById('ab-hours')?.addEventListener('input', e => { hours = Math.max(0, Math.min(200, parseInt(e.target.value)||0)); render(); });
      document.getElementById('ab-minutes')?.addEventListener('input', e => { minutes = Math.max(0, Math.min(59, parseInt(e.target.value)||0)); render(); });
      // Speed cards
      document.querySelectorAll('.ab-speed-card').forEach(card => {
        card.addEventListener('click', () => { speed = parseFloat(card.dataset.speed); customSpeed = ''; render(); });
      });
      // Comparison grid clicks
      document.querySelectorAll('.ab-compare-col[data-speed]').forEach(col => {
        col.addEventListener('click', () => { speed = parseFloat(col.dataset.speed); customSpeed = ''; render(); });
      });
      // Custom speed
      document.getElementById('ab-custom-speed')?.addEventListener('input', e => { customSpeed = e.target.value; render(); });
      // Daily slider
      document.getElementById('ab-daily')?.addEventListener('input', e => { dailyHours = parseFloat(e.target.value); render(); });
    }

    if (activeTab === 'wordcount') {
      document.getElementById('ab-wordcount')?.addEventListener('input', calcWordCount);
      document.getElementById('ab-narration-speed')?.addEventListener('input', calcWordCount);
      calcWordCount();
    }

    if (activeTab === 'progress') {
      ['ab-total-h','ab-total-m','ab-current-h','ab-current-m','ab-prog-speed'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calcProgress);
      });
      calcProgress();
    }

    if (activeTab === 'deadline') {
      ['ab-rem-h','ab-rem-m','ab-deadline','ab-dl-speed'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calcDeadline);
      });
      calcDeadline();
    }
  }

  // Initial render
  render();
});
