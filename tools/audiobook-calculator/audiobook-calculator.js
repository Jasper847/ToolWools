/* Audiobook Speed Calculator v2 — 4 Modes, 20 Presets, Custom Speed */
document.addEventListener('DOMContentLoaded', () => {
  const SPEEDS = [
    { value: 1.0, label: '1x', tag: null, bestFor: 'Theatrical / Poetry', badgeClass: 'badge-poetry' },
    { value: 1.25, label: '1.25x', tag: 'Popular', bestFor: 'All Beginners', badgeClass: 'badge-beginners' },
    { value: 1.5, label: '1.5x', tag: 'Sweet Spot', bestFor: 'Most Listeners ★', badgeClass: 'badge-most' },
    { value: 1.75, label: '1.75x', tag: null, bestFor: 'Non-Fiction', badgeClass: 'badge-nonfiction' },
    { value: 2.0, label: '2x', tag: 'Power', bestFor: 'Re-reads', badgeClass: 'badge-rereads' },
    { value: 2.25, label: '2.25x', tag: null, bestFor: 'Advanced', badgeClass: 'badge-advanced' },
    { value: 2.5, label: '2.5x', tag: null, bestFor: 'Elite', badgeClass: 'badge-elite' },
    { value: 3.0, label: '3x', tag: 'Max', bestFor: 'Review Only', badgeClass: 'badge-review' }
  ];
  const BOOKS = [
    {t:'Atomic Habits',h:5,m:35},{t:'The Psychology of Money',h:5,m:48},{t:'Project Hail Mary',h:16,m:10},
    {t:'A Court of Thorns and Roses',h:11,m:24},{t:'The 48 Laws of Power',h:23,m:6},{t:'Educated',h:12,m:10},
    {t:'Sapiens',h:15,m:17},{t:'The Subtle Art of Not Giving a F*ck',h:5,m:17},{t:'Dune',h:21,m:2},
    {t:'Harry Potter (Complete Series)',h:117,m:0},{t:'Lord of the Rings (Complete)',h:54,m:0},
    {t:'Becoming',h:19,m:3},{t:"Can't Hurt Me",h:13,m:37},{t:'The Alchemist',h:4,m:0},
    {t:'Thinking, Fast and Slow',h:20,m:28},{t:'12 Rules for Life',h:15,m:40},
    {t:'Where the Crawdads Sing',h:12,m:12},{t:'Rich Dad Poor Dad',h:6,m:9},
    {t:'It Ends With Us',h:9,m:30},{t:'The Great Gatsby',h:4,m:49},
  ];
  let hours=10,minutes=30,speed=1.5,dailyHours=2,customSpd='',tab='speed';
  const ws=document.getElementById('tool-workspace');
  const toHM=m=>({h:Math.floor(m/60),m:Math.round(m%60)});
  const fmt=hm=>`${hm.h}h ${hm.m}m`;
  const eff=()=>{const c=parseFloat(customSpd);return(c>0&&c<=5)?c:speed;};
  const dateIn=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.toISOString().split('T')[0];};

  function render(){
    const s=eff(),total=hours*60+minutes,adj=total/s,saved=total-adj;
    const pct=total>0?Math.round((saved/total)*100):0;
    const bpy=total>0?((365*dailyHours*60)/adj).toFixed(1):0;
    const days=total>0?Math.ceil(adj/(dailyHours*60)):0;
    ws.innerHTML=`
<div class="ab-tabs" role="tablist">
  <button class="ab-tab ${tab==='speed'?'active':''}" data-t="speed">⚡ Speed Calculator</button>
  <button class="ab-tab ${tab==='wordcount'?'active':''}" data-t="wordcount">📖 Word Count</button>
  <button class="ab-tab ${tab==='progress'?'active':''}" data-t="progress">📊 Progress</button>
  <button class="ab-tab ${tab==='deadline'?'active':''}" data-t="deadline">🎯 Finish By</button>
</div>
<div class="ab-tab-content">${tab==='speed'?speedUI(total,s,adj,saved,pct,bpy,days):tab==='wordcount'?wordUI():tab==='progress'?progressUI():deadlineUI()}</div>`;
    
    // Render the dynamic responsive comparison table
    const tableBody = document.getElementById('compareTableBody');
    if (tableBody) {
      tableBody.innerHTML = SPEEDS.map(sp => {
        const isSelected = sp.value === s;
        const m = total / sp.value;
        const hm = toHM(m);
        const savedMins = total - m;
        const p = total > 0 ? (savedMins / total) * 100 : 0;
        const daysToFinish = total > 0 ? Math.ceil(m / (dailyHours * 60)) : 0;

        const formattedTime = total > 0 ? `${hm.h}h${hm.m > 0 ? ' ' + hm.m + 'm' : ''}` : '—';
        const formattedSaved = total > 0 && savedMins > 0 ? `${toHM(savedMins).h}h${toHM(savedMins).m > 0 ? ' ' + toHM(savedMins).m + 'm' : ''}` : '—';
        const formattedPct = total > 0 && p > 0 ? `${p.toFixed(1)}%` : '—';
        const formattedDays = total > 0 ? `${daysToFinish} day${daysToFinish !== 1 ? 's' : ''}` : '—';

        return `
          <tr class="${isSelected ? 'active' : ''}" data-speed="${sp.value}">
            <td style="font-weight: 700;">
              <span>${sp.label}</span>
              ${isSelected ? '<br><span class="ab-selected-tag">Selected</span>' : ''}
            </td>
            <td style="font-weight: ${isSelected ? '700' : '500'};">${formattedTime}</td>
            <td>${formattedSaved}</td>
            <td>${formattedPct}</td>
            <td>${formattedDays}</td>
            <td>
              <span class="ab-best-badge ${sp.badgeClass}">${sp.bestFor}</span>
            </td>
          </tr>
        `;
      }).join('');

      // Add click listeners to rows to select speed
      tableBody.querySelectorAll('tr').forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          speed = parseFloat(row.dataset.speed);
          customSpd = ''; // Reset custom speed if selecting preset
          const csInput = document.getElementById('cs');
          if (csInput) csInput.value = '';
          render();
        });
      });
    }

    wire();
  }

  function speedUI(total,s,adj,saved,pct,bpy,days){
    const a=toHM(adj),sv=toHM(saved);
    return `
<div class="ab-input-group" style="margin-bottom:16px"><label class="ab-input-label">Quick Select Popular Audiobook</label>
<select id="bp" class="tool-select" style="width:100%"><option value="">— Or enter custom duration below —</option>${BOOKS.map(b=>`<option value="${b.h}:${b.m}"${hours===b.h&&minutes===b.m?' selected':''}>${b.t} (${b.h}h ${b.m}m)</option>`).join('')}</select></div>
<div class="ab-input-grid"><div class="ab-input-group"><label class="ab-input-label" for="ah">Hours</label><input type="number" id="ah" class="tool-input" value="${hours}" min="0" max="200" style="font-size:20px;font-weight:700;text-align:center"></div>
<div class="ab-input-group"><label class="ab-input-label" for="am">Minutes</label><input type="number" id="am" class="tool-input" value="${minutes}" min="0" max="59" style="font-size:20px;font-weight:700;text-align:center"></div></div>
<label class="ab-input-label" style="margin:20px 0 10px;display:block">Choose Your Playback Speed</label>
<div class="ab-speed-grid">${SPEEDS.map(sp=>`<button class="ab-speed-card${sp.value===speed&&!customSpd?' active':''}" data-s="${sp.value}"><div class="ab-speed-value">${sp.label}</div>${sp.tag?'<div class="ab-speed-tag">'+sp.tag+'</div>':''}</button>`).join('')}</div>
<div class="ab-slider-row" style="margin-top:12px"><label class="ab-input-label" style="white-space:nowrap">Custom:</label><input type="number" id="cs" class="tool-input" value="${customSpd}" min="0.5" max="5" step="0.05" placeholder="e.g. 1.35" style="width:90px;text-align:center"><span style="font-size:12px;color:var(--color-muted)">× (0.5–5)</span></div>
<label class="ab-input-label" style="margin-top:20px;display:block">How Many Hours Do You Listen Daily?</label>
<div class="ab-slider-row"><input type="range" id="dh" min="0.5" max="8" step="0.5" value="${dailyHours}"><span class="ab-slider-value">${dailyHours}h/day</span></div>
<div class="ab-results-grid">
<div class="ab-result-card"><div class="ab-result-value">${fmt(a)}</div><div class="ab-result-label">Your Adjusted Time</div></div>
<div class="ab-result-card"><div class="ab-result-value">${fmt(sv)}</div><div class="ab-result-label">Time You'll Save</div></div>
<div class="ab-result-card"><div class="ab-result-value">${pct}%</div><div class="ab-result-label">Speed Increase</div></div>
<div class="ab-result-card"><div class="ab-result-value">${bpy}</div><div class="ab-result-label">Books Per Year</div></div></div>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin:16px 0"><span class="tool-badge">Finish in ${days} day${days!==1?'s':''}</span><span class="tool-badge">Original: ${hours}h ${minutes}m</span><span class="tool-badge">${Math.round(150*s)} words/min</span></div>`;
  }

  function wordUI(){return `
<div class="ab-input-group" style="margin-bottom:16px"><label class="ab-input-label" for="wc">Total Word Count</label><input type="number" id="wc" class="tool-input" value="80000" min="1000" max="500000" style="font-size:18px;font-weight:700;text-align:center"></div>
<div class="ab-input-group"><label class="ab-input-label">Narration Speed</label><div class="ab-slider-row"><input type="range" id="ns" min="120" max="180" step="5" value="150"><span class="ab-slider-value" id="nv">150 WPM</span></div><p style="font-size:12px;color:var(--color-muted)">Average: 150 · Slow: 120–130 · Fast: 165–180</p></div>
<div id="wcr"></div>`;}

  function progressUI(){return `
<div class="ab-input-grid"><div class="ab-input-group"><label class="ab-input-label">Total (hours)</label><input type="number" id="th" class="tool-input" value="12" min="0" max="200" style="text-align:center"></div><div class="ab-input-group"><label class="ab-input-label">Total (min)</label><input type="number" id="tm" class="tool-input" value="30" min="0" max="59" style="text-align:center"></div></div>
<div class="ab-input-grid" style="margin-top:12px"><div class="ab-input-group"><label class="ab-input-label">Current (hours)</label><input type="number" id="ch" class="tool-input" value="4" min="0" max="200" style="text-align:center"></div><div class="ab-input-group"><label class="ab-input-label">Current (min)</label><input type="number" id="cm" class="tool-input" value="15" min="0" max="59" style="text-align:center"></div></div>
<div class="ab-input-group" style="margin-top:12px"><label class="ab-input-label">Speed</label><div class="ab-slider-row"><input type="range" id="ps" min="1" max="3" step="0.25" value="1.5"><span class="ab-slider-value" id="pv">1.5×</span></div></div>
<div id="pr"></div>`;}

  function deadlineUI(){return `
<div class="ab-input-grid"><div class="ab-input-group"><label class="ab-input-label">Remaining (hours)</label><input type="number" id="rh" class="tool-input" value="8" min="0" max="200" style="text-align:center"></div><div class="ab-input-group"><label class="ab-input-label">Remaining (min)</label><input type="number" id="rm" class="tool-input" value="0" min="0" max="59" style="text-align:center"></div></div>
<div class="ab-input-group" style="margin-top:12px"><label class="ab-input-label">Finish by:</label><input type="date" id="dl" class="tool-input" value="${dateIn(7)}" min="${dateIn(0)}" style="font-size:16px"></div>
<div class="ab-input-group" style="margin-top:12px"><label class="ab-input-label">Speed</label><div class="ab-slider-row"><input type="range" id="ds" min="1" max="3" step="0.25" value="1.5"><span class="ab-slider-value" id="dv">1.5×</span></div></div>
<div id="dr"></div>`;}

  function wire(){
    document.querySelectorAll('.ab-tab').forEach(t=>t.addEventListener('click',()=>{tab=t.dataset.t;render();}));
    if(tab==='speed'){
      document.getElementById('bp')?.addEventListener('change',e=>{if(e.target.value){const[h,m]=e.target.value.split(':').map(Number);hours=h;minutes=m;render();}});
      document.getElementById('ah')?.addEventListener('input',e=>{hours=Math.max(0,Math.min(200,parseInt(e.target.value)||0));render();});
      document.getElementById('am')?.addEventListener('input',e=>{minutes=Math.max(0,Math.min(59,parseInt(e.target.value)||0));render();});
      document.querySelectorAll('.ab-speed-card').forEach(c=>c.addEventListener('click',()=>{speed=parseFloat(c.dataset.s);customSpd='';render();}));
      document.getElementById('cs')?.addEventListener('input',e=>{customSpd=e.target.value;render();});
      document.getElementById('dh')?.addEventListener('input',e=>{dailyHours=parseFloat(e.target.value);render();});
    }
    if(tab==='wordcount'){const calc=()=>{const wc=parseInt(document.getElementById('wc')?.value)||80000,ns=parseInt(document.getElementById('ns')?.value)||150,t=wc/ns,h=toHM(t);document.getElementById('nv').textContent=ns+' WPM';document.getElementById('wcr').innerHTML=`<div class="ab-results-grid" style="margin-top:20px"><div class="ab-result-card"><div class="ab-result-value">${fmt(h)}</div><div class="ab-result-label">Estimated Runtime</div></div><div class="ab-result-card"><div class="ab-result-value">${fmt(toHM(t/1.5))}</div><div class="ab-result-label">At 1.5× Speed</div></div><div class="ab-result-card"><div class="ab-result-value">${fmt(toHM(t/2))}</div><div class="ab-result-label">At 2× Speed</div></div><div class="ab-result-card"><div class="ab-result-value">${Math.round(wc/275)}</div><div class="ab-result-label">~Pages</div></div></div><p style="font-size:13px;color:var(--color-muted);margin-top:12px">${wc.toLocaleString()} words at ${ns} WPM ≈ <strong style="color:var(--color-dark)">${fmt(h)}</strong> audiobook. At 1.5×: ${fmt(toHM(t/1.5))}. At 2×: ${fmt(toHM(t/2))}.</p>`;};document.getElementById('wc')?.addEventListener('input',calc);document.getElementById('ns')?.addEventListener('input',calc);calc();}
    if(tab==='progress'){const calc=()=>{const t=(parseInt(document.getElementById('th')?.value)||0)*60+(parseInt(document.getElementById('tm')?.value)||0),c=(parseInt(document.getElementById('ch')?.value)||0)*60+(parseInt(document.getElementById('cm')?.value)||0),s=parseFloat(document.getElementById('ps')?.value)||1;if(t<=0)return;const p=Math.min(100,Math.round((c/t)*100)),r=Math.max(0,t-c),ra=r/s;document.getElementById('pv').textContent=s+'×';document.getElementById('pr').innerHTML=`<div style="background:var(--color-border);border-radius:8px;height:12px;overflow:hidden;margin:16px 0"><div style="background:var(--color-primary);height:100%;width:${p}%;border-radius:8px;transition:width .3s"></div></div><div class="ab-results-grid"><div class="ab-result-card"><div class="ab-result-value">${p}%</div><div class="ab-result-label">Completed</div></div><div class="ab-result-card"><div class="ab-result-value">${fmt(toHM(r))}</div><div class="ab-result-label">Remaining</div></div><div class="ab-result-card"><div class="ab-result-value">${fmt(toHM(ra))}</div><div class="ab-result-label">At ${s}× Speed</div></div><div class="ab-result-card"><div class="ab-result-value">${100-p}%</div><div class="ab-result-label">Left</div></div></div>`;};['th','tm','ch','cm','ps'].forEach(id=>document.getElementById(id)?.addEventListener('input',calc));calc();}
    if(tab==='deadline'){const calc=()=>{const r=((parseInt(document.getElementById('rh')?.value)||0)*60+(parseInt(document.getElementById('rm')?.value)||0)),dl=document.getElementById('dl')?.value,s=parseFloat(document.getElementById('ds')?.value)||1;if(!dl||r<=0)return;const today=new Date();today.setHours(0,0,0,0);const target=new Date(dl);target.setHours(0,0,0,0);const d=Math.max(1,Math.ceil((target-today)/(864e5))),adj=r/s,daily=adj/d;document.getElementById('dv').textContent=s+'×';document.getElementById('dr').innerHTML=`<div class="ab-results-grid" style="margin-top:16px"><div class="ab-result-card"><div class="ab-result-value">${d}</div><div class="ab-result-label">Days Left</div></div><div class="ab-result-card"><div class="ab-result-value">${fmt(toHM(daily))}</div><div class="ab-result-label">Listen Daily</div></div><div class="ab-result-card"><div class="ab-result-value">${fmt(toHM(adj))}</div><div class="ab-result-label">Adjusted Total</div></div><div class="ab-result-card"><div class="ab-result-value">${fmt(toHM(r))}</div><div class="ab-result-label">Original Left</div></div></div><p style="font-size:14px;color:var(--color-muted);margin-top:12px">Listen <strong style="color:var(--color-primary)">${fmt(toHM(daily))}</strong> per day at ${s}× to finish by <strong style="color:var(--color-dark)">${target.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</strong>.</p>`;};['rh','rm','dl','ds'].forEach(id=>document.getElementById(id)?.addEventListener('input',calc));calc();}
  }
  render();
});
