document.addEventListener('DOMContentLoaded', () => {
  const ws = document.getElementById('tool-workspace');
  ws.innerHTML = `
    <div class="tool-controls-row" style="flex-direction:column;gap:12px;align-items:stretch">
      <label>Product/Service: <input type="text" id="product" class="tool-input" placeholder="e.g. AI-powered project management software" style="width:100%"></label>
      <label>Target Audience: <input type="text" id="audience" class="tool-input" placeholder="e.g. Remote teams and startup founders" style="width:100%"></label>
      <label>Key Benefit: <input type="text" id="benefit" class="tool-input" placeholder="e.g. Ship projects 3x faster with AI automation" style="width:100%"></label>
      <label>Call to Action: <input type="text" id="cta" class="tool-input" placeholder="e.g. Start your free trial" style="width:100%"></label>
    </div>
    <div class="tool-controls-row">
      <label>Framework: <select id="framework" class="tool-select">
        <option value="all">All Frameworks</option>
        <option value="aida">AIDA (Attention-Interest-Desire-Action)</option>
        <option value="pas">PAS (Problem-Agitate-Solution)</option>
        <option value="bab">BAB (Before-After-Bridge)</option>
        <option value="4ps">4Ps (Promise-Picture-Proof-Push)</option>
        <option value="fab">FAB (Features-Advantages-Benefits)</option>
      </select></label>
    </div>
    <div class="tool-bottom-actions">
      <button id="btn-generate" class="btn btn-primary">Generate Ad Copy</button>
      <button id="btn-copy-all" class="btn btn-secondary">Copy All</button>
    </div>
    <div id="results" style="margin-top:16px"></div>`;

  function gen() {
    const product = document.getElementById('product').value.trim();
    const audience = document.getElementById('audience').value.trim();
    const benefit = document.getElementById('benefit').value.trim();
    const cta = document.getElementById('cta').value.trim() || 'Get started today';
    const framework = document.getElementById('framework').value;

    if (!product || !audience) { showToast('Enter at least a product and target audience.', 'warning'); return; }

    const benefitText = benefit || 'transform the way you work';
    const copies = [];

    // AIDA
    if (framework === 'all' || framework === 'aida') {
      copies.push({
        name: 'AIDA', label: 'Attention → Interest → Desire → Action',
        text: `🎯 **Attention:** ${audience}, are you still struggling with outdated tools?\n\n💡 **Interest:** ${product} uses intelligent automation to ${benefitText}.\n\n🔥 **Desire:** Imagine cutting your workload in half while delivering better results. That's what our users experience every day.\n\n👉 **Action:** ${cta} — no credit card required.`
      });
    }

    // PAS
    if (framework === 'all' || framework === 'pas') {
      copies.push({
        name: 'PAS', label: 'Problem → Agitate → Solution',
        text: `😤 **Problem:** ${audience} waste hours on manual tasks that should be automated.\n\n😰 **Agitate:** Every minute spent on repetitive work is a minute lost on strategy, creativity, and growth. Your competitors aren't waiting.\n\n✅ **Solution:** ${product} — ${benefitText}. ${cta}.`
      });
    }

    // BAB
    if (framework === 'all' || framework === 'bab') {
      copies.push({
        name: 'BAB', label: 'Before → After → Bridge',
        text: `📍 **Before:** Drowning in manual processes, missed deadlines, and team burnout.\n\n✨ **After:** Streamlined workflows, on-time delivery, and a team that actually enjoys their work.\n\n🌉 **Bridge:** ${product} makes the transformation possible. ${benefitText}. ${cta}.`
      });
    }

    // 4Ps
    if (framework === 'all' || framework === '4ps') {
      copies.push({
        name: '4Ps', label: 'Promise → Picture → Proof → Push',
        text: `🏆 **Promise:** ${benefitText} — guaranteed.\n\n🖼️ **Picture:** Imagine ${audience.toLowerCase()} hitting every deadline, collaborating seamlessly, and scaling without the chaos.\n\n📊 **Proof:** Trusted by thousands of teams worldwide. Average 47% productivity increase in 30 days.\n\n🚀 **Push:** ${cta}. Join the teams already winning with ${product}.`
      });
    }

    // FAB
    if (framework === 'all' || framework === 'fab') {
      copies.push({
        name: 'FAB', label: 'Features → Advantages → Benefits',
        text: `⚙️ **Features:** ${product} includes AI automation, real-time collaboration, smart scheduling, and analytics dashboards.\n\n📈 **Advantages:** Unlike traditional tools, everything updates in real-time with zero manual input required.\n\n💎 **Benefits:** For ${audience.toLowerCase()}, this means ${benefitText}. More output, less stress. ${cta}.`
      });
    }

    // Render
    let html = '';
    copies.forEach(c => {
      const formatted = c.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      html += `<div style="padding:20px;margin-bottom:16px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-card,16px)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div><span style="font-weight:800;font-size:16px;color:var(--color-primary)">${c.name}</span><span style="font-size:12px;color:var(--color-muted);margin-left:8px">${c.label}</span></div>
          <button class="copy-single" style="padding:6px 12px;font-size:12px;border:1px solid var(--color-border);border-radius:6px;background:var(--color-bg);cursor:pointer;color:var(--color-muted)">Copy</button>
        </div>
        <div style="font-size:15px;line-height:1.8;color:var(--color-dark)" class="copy-content">${formatted}</div>
      </div>`;
    });
    document.getElementById('results').innerHTML = html;

    // Wire copy buttons
    document.querySelectorAll('.copy-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.closest('div').parentElement.querySelector('.copy-content').textContent;
        navigator.clipboard.writeText(text).then(() => showToast('Copied!', 'success'));
      });
    });

    showToast(`${copies.length} ad copy variation${copies.length > 1 ? 's' : ''} generated!`, 'success');
  }

  document.getElementById('btn-generate').addEventListener('click', gen);
  document.getElementById('btn-copy-all').addEventListener('click', () => {
    const all = Array.from(document.querySelectorAll('.copy-content')).map(el => el.textContent).join('\n\n---\n\n');
    if (!all) return;
    navigator.clipboard.writeText(all).then(() => showToast('All variations copied!', 'success'));
  });
});
