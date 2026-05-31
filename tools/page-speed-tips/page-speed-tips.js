document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const resultsSection = document.getElementById("results-section");
  const scoreValue = document.getElementById("score-value");
  const scoreFill = document.getElementById("score-fill");
  const scoreTitle = document.getElementById("score-title");
  const scoreSummary = document.getElementById("score-summary");
  const tipsContainer = document.getElementById("tips-container");

  const btnAudit = document.getElementById("btn-audit");
  const btnClear = document.getElementById("btn-clear");

  const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Non-Optimized Sample Site</title>
  
  <!-- Render-blocking scripts in head -->
  <script src="https://example.com/analytics.js"></script>
  <script src="https://example.com/jquery.js"></script>

  <!-- Multiple external stylesheets -->
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="header.css">
  <link rel="stylesheet" href="footer.css">
  <link rel="stylesheet" href="sidebar.css">
</head>
<body>
  <h1>Page Speed Tips</h1>
  <!-- Image without lazy loading and using legacy PNG formatting -->
  <img src="hero-banner.png" alt="Hero Banner">
  <img src="footer-logo.jpg" alt="Logo">
</body>
</html>`;

  input.value = SAMPLE_HTML;

  function runPerformanceAudit(html) {
    const tips = [];
    let score = 0;

    // 1. Script blocking check (25 pts)
    const headBlock = html.match(/<head>([\s\S]*?)<\/head>/i);
    let hasBlockingScripts = false;
    if (headBlock) {
      const headContent = headBlock[1];
      const scripts = headContent.match(/<script[^>]*>/gi) || [];
      const safeScripts = headContent.match(/<script[^>]*(?:async|defer)[^>]*>/gi) || [];
      if (scripts.length > safeScripts.length) {
        hasBlockingScripts = true;
      }
    }

    if (!hasBlockingScripts) {
      score += 25;
      tips.push({
        severity: "good",
        title: "Scripts are Non-Blocking",
        desc: "No render-blocking scripts were detected in the HTML <head>. Scripts are either deferred, asynchronous, or placed at the bottom of the body."
      });
    } else {
      tips.push({
        severity: "critical",
        title: "Render-blocking Scripts in <head>",
        desc: "We found scripts in the document head without 'async' or 'defer' attributes. These scripts halt DOM construction and delay the initial paint of the website."
      });
    }

    // 2. Lazy load images check (20 pts)
    const images = html.match(/<img[^>]*>/gi) || [];
    const lazyImages = html.match(/<img[^>]*loading=["']lazy["'][^>]*>/gi) || [];
    
    if (images.length === 0) {
      score += 20;
      tips.push({
        severity: "good",
        title: "No Image Lazy-Load Bottlenecks",
        desc: "No images were found in the HTML source, meaning image loading won't delay your initial paint cycles."
      });
    } else if (lazyImages.length >= images.length) {
      score += 20;
      tips.push({
        severity: "good",
        title: "Images Configured for Lazy-Loading",
        desc: "Great! All images use the 'loading=\"lazy\"' attribute. This saves user bandwidth and improves initial page load speed."
      });
    } else {
      score += Math.round((lazyImages.length / images.length) * 20);
      tips.push({
        severity: "warning",
        title: "Images Missing 'loading=\"lazy\"'",
        desc: `Only ${lazyImages.length} out of ${images.length} image tags are lazy-loaded. Non-lazy images located below the fold will block initial viewport paints.`
      });
    }

    // 3. Modern image formats check (15 pts)
    const legacyImages = html.match(/\.(?:png|jpg|jpeg)\b/gi) || [];
    if (legacyImages.length === 0) {
      score += 15;
      tips.push({
        severity: "good",
        title: "Using Modern Image Formats",
        desc: "No legacy .png or .jpg image extension URLs were identified. Using modern WebP or AVIF formats reduces image payload weight by up to 80%."
      });
    } else {
      tips.push({
        severity: "warning",
        title: "Legacy Image Formats Detected (.png, .jpg)",
        desc: "We identified older image formats (.png or .jpg). Consider converting images to next-gen formats like WebP or AVIF to drastically shrink payload sizes."
      });
    }

    // 4. Google Fonts preconnect (20 pts)
    const usesGoogleFonts = /fonts\.googleapis\.com/i.test(html);
    const hasPreconnect = /<link[^>]*rel=["']preconnect["'][^>]*href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>/i.test(html);

    if (!usesGoogleFonts) {
      score += 20;
      tips.push({
        severity: "good",
        title: "No Google Fonts Overhead",
        desc: "Google Fonts are not loaded externally, avoiding typography download request latency."
      });
    } else if (hasPreconnect) {
      score += 20;
      tips.push({
        severity: "good",
        title: "Font Delivery preconnect is Active",
        desc: "We detected the fonts.gstatic.com preconnect link tag. This triggers DNS/TCP handshakes early to fetch font assets faster."
      });
    } else {
      tips.push({
        severity: "warning",
        title: "Google Fonts Preconnect Link Missing",
        desc: "You are loading Google Fonts but missing the preconnect header link '<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>'. Adding this speeds up font delivery by 100-300ms."
      });
    }

    // 5. CSS Stylesheet count (20 pts)
    const stylesheets = html.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
    if (stylesheets.length <= 2) {
      score += 20;
      tips.push({
        severity: "good",
        title: "Optimized Stylesheet Requests",
        desc: `Only ${stylesheets.length} external stylesheet(s) are loaded. Keeping request counts low prevents First Contentful Paint bottlenecks.`
      });
    } else {
      score += 5;
      tips.push({
        severity: "warning",
        title: "Multiple External CSS Files",
        desc: `We found ${stylesheets.length} external CSS files. External stylesheets are render-blocking. Merge your styles or inline critical CSS to speed up rendering.`
      });
    }

    return { score, tips };
  }

  function renderAudit(htmlText) {
    const { score, tips } = runPerformanceAudit(htmlText);

    // Update Circle loader
    scoreValue.textContent = `${score}%`;
    const offset = 314 - (314 * score) / 100;
    scoreFill.style.strokeDashoffset = offset;

    // Set colors
    if (score >= 80) {
      scoreFill.style.stroke = "var(--color-green)";
      scoreTitle.textContent = "Excellent Page Speed Performance!";
      scoreSummary.textContent = "Your HTML markup structure is highly optimized. Preconnect linkages, deferred scripts, and lazy attributes match standard web vitals metrics.";
    } else if (score >= 50) {
      scoreFill.style.stroke = "var(--color-primary)";
      scoreTitle.textContent = "Moderate Performance Potential";
      scoreSummary.textContent = "Some performance bottlenecks were detected. Apply the recommended tweaks below to speed up paint cycles.";
    } else {
      scoreFill.style.stroke = "var(--color-red)";
      scoreTitle.textContent = "Poor Loading Speed Score";
      scoreSummary.textContent = "Critical blocking elements are present. Pages will load slowly, triggering layouts shift and hurting user conversion rates.";
    }

    // Pop recommendations
    tipsContainer.innerHTML = "";
    tips.forEach(tip => {
      const div = document.createElement("div");
      div.className = "tip-item";
      
      let badgeClass = "";
      if (tip.severity === "critical") badgeClass = "sev-critical";
      else if (tip.severity === "warning") badgeClass = "sev-warning";
      else badgeClass = "sev-good";

      div.innerHTML = `
        <div>
          <span class="tip-severity-badge ${badgeClass}">${tip.severity}</span>
          <div class="tip-title">${tip.title}</div>
          <div class="tip-desc">${tip.desc}</div>
        </div>
      `;
      tipsContainer.appendChild(div);
    });

    resultsSection.style.display = "block";
  }

  btnAudit.addEventListener("click", () => {
    const htmlCode = input.value.trim();
    if (!htmlCode) {
      showToast("Please enter HTML source code first.", "warning");
      return;
    }
    renderAudit(htmlCode);
    showToast("Speed audit completed!", "success");
  });

  btnClear.addEventListener("click", () => {
    input.value = "";
    resultsSection.style.display = "none";
    showToast("Cleared", "success");
  });

  // Run initial audit
  renderAudit(SAMPLE_HTML);
});
