/* Random Word Generator JS */
document.addEventListener('DOMContentLoaded', () => {
  // Comprehensive word lists by category
  const words = {
    noun: ['apple','bridge','cloud','dragon','engine','forest','garden','harbor','island','jungle','kingdom','lantern','mountain','nebula','ocean','palace','quarter','river','shadow','thunder','umbrella','village','window','xenon','yellow','zenith','anchor','beacon','castle','desert','eclipse','flame','glacier','harvest','illusion','journey','kernel','legend','marble','notion','oracle','puzzle','quartz','rocket','stream','temple','universe','valley','whisper','xylem','yonder','zephyr','balloon','canyon','diamond','empire','falcon','horizon','iceberg','labyrinth','missile','nucleus','obsidian','phantom','quantum','ridge','silence','tornado','vortex','wanderer','artifact','blizzard','crystal','dynasty','emerald','fortress','gemstone','hurricane','infinity','jewel','labyrinth','melody','nitrogen','obelisk','prism','quasar','resonance','spectrum','twilight','vapor','wilderness','paradox','telescope','labyrinth'],
    verb: ['achieve','build','create','deliver','enhance','forge','generate','harvest','illuminate','journey','kindle','launch','manifest','navigate','optimize','pioneer','question','realize','synthesize','transform','unveil','validate','witness','examine','yield','accelerate','balance','combine','develop','elevate','facilitate','grow','harmonize','integrate','leverage','master','nurture','orchestrate','produce','radiate','strengthen','transition','upgrade','venture','amplify','broaden','cultivate','define','explore','foster','inspire','motivate','organize','persist','refine','stimulate','transcend','unify','visualize','adapt','boost','challenge','discover','educate','fulfill','guide','heal','imagine','invent','lead','mentor','overcome','pursue','restore','serve','teach','understand','wonder'],
    adjective: ['ancient','brilliant','calm','dazzling','elegant','fierce','glorious','humble','immense','joyful','keen','luminous','majestic','noble','optimal','pristine','radiant','serene','timeless','unique','vibrant','wise','extraordinary','youthful','zealous','abstract','bold','creative','dynamic','energetic','fierce','graceful','harmonious','innovative','jubilant','kind','lush','magnificent','nimble','outstanding','powerful','quiet','resilient','stunning','thorough','ultimate','valiant','wonderful','authentic','breathtaking','compelling','dedicated','efficient','fearless','genuine','heroic','inspiring','legendary','mysterious','natural','outstanding','passionate','remarkable','spectacular','tremendous','unbreakable','vivid'],
    adverb: ['actively','boldly','carefully','deeply','effectively','fiercely','gracefully','honestly','infinitely','joyfully','keenly','lightly','masterfully','naturally','optimally','powerfully','quickly','rapidly','smoothly','thoroughly','uniquely','vividly','wisely','exactly','zealously','absolutely','brilliantly','clearly','decisively','elegantly','fluently','gently','harmoniously','intensely','justly','kindly','luminously','magnificently','nimbly','openly','precisely','quietly','remarkably','seamlessly','tactfully','unfailingly','valiantly','wholeheartedly','accurately','boundlessly','compassionately','diligently','earnestly','faithfully','genuinely','humbly','instantaneously','justifiably','knowingly','limitlessly','mindfully','nobly','objectively']
  };

  function getWords() {
    const cat = document.getElementById('category').value;
    const qty = parseInt(document.getElementById('quantity').value) || 20;
    const minL = parseInt(document.getElementById('min-len').value) || 3;
    const maxL = parseInt(document.getElementById('max-len').value) || 12;
    const unique = document.getElementById('opt-unique').checked;
    const cap = document.getElementById('opt-capitalize').checked;

    let pool = cat === 'all' 
      ? [...words.noun, ...words.verb, ...words.adjective, ...words.adverb]
      : words[cat] || [];

    pool = pool.filter(w => w.length >= minL && w.length <= maxL);
    if (!pool.length) return [];

    const result = [];
    const used = new Set();
    const attempts = qty * 20;
    let i = 0;
    while (result.length < qty && i++ < attempts) {
      const word = pool[Math.floor(Math.random() * pool.length)];
      if (unique && used.has(word)) continue;
      used.add(word);
      result.push(cap ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    return result;
  }

  function render(wordList) {
    const out = document.getElementById('words-output');
    if (!wordList.length) {
      out.innerHTML = '<span style="color:var(--color-muted);font-size:14px">No words found matching your criteria. Try adjusting length or category.</span>';
      return;
    }
    out.innerHTML = wordList.map(w =>
      `<span class="tag-chip" style="cursor:pointer" title="Click to copy" onclick="navigator.clipboard.writeText('${w}').then(()=>showToast('Copied: ${w}','success'))">${w}</span>`
    ).join('');
    document.getElementById('stat-count').textContent = wordList.length;
    const avg = wordList.reduce((a, w) => a + w.length, 0) / wordList.length;
    document.getElementById('stat-avg').textContent = avg.toFixed(1);
  }

  document.getElementById('btn-generate').addEventListener('click', () => {
    const w = getWords();
    render(w);
    showToast(`Generated ${w.length} random words!`, 'success');
  });

  document.getElementById('btn-copy').addEventListener('click', () => {
    const chips = document.querySelectorAll('#words-output .tag-chip');
    if (!chips.length) { showToast('Generate words first.', 'warning'); return; }
    const text = Array.from(chips).map(c => c.textContent).join('\n');
    navigator.clipboard.writeText(text).then(() => showToast('All words copied!', 'success'));
  });

  document.getElementById('btn-copy-csv').addEventListener('click', () => {
    const chips = document.querySelectorAll('#words-output .tag-chip');
    if (!chips.length) { showToast('Generate words first.', 'warning'); return; }
    const text = Array.from(chips).map(c => c.textContent).join(', ');
    navigator.clipboard.writeText(text).then(() => showToast('Copied as CSV!', 'success'));
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('words-output').innerHTML = '<span style="color:var(--color-muted);font-size:14px">Generated words will appear here as clickable chips.</span>';
    document.getElementById('stat-count').textContent = '0';
    document.getElementById('stat-avg').textContent = '0';
  });

  // Auto-generate on load
  render(getWords());
});
