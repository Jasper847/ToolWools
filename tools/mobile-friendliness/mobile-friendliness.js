document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const resultsSection = document.getElementById("results-section");
  const scoreValue = document.getElementById("score-value");
  const scoreFill = document.getElementById("score-fill");
  const scoreTitle = document.getElementById("score-title");
  const scoreSummary = document.getElementById("score-summary");
  const auditContainer = document.getElementById("audit-container");

  const btnTest = document.getElementById("btn-test");
  const btnClear = document.getElementById("btn-clear");

  // Sample html to prefill so it looks premium on initial load
  const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- Viewport Meta Tag for Mobile Responsiveness -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mobile Friendly Sample</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 16px; }
    /* Responsive Media Query styling */
    @media (max-width: 768px) {
      .container { width: 100%; padding: 8px; }
    }
  </style>
</head>
<body>
  <div class="container" style="max-width: 1200px; margin: 0 auto;">
    <h1>Responsive Web Layout</h1>
    <p>This layout automatically adapts to any phone, tablet, or desktop screen width.</p>
  </div>
</body>
</html>`;

  input.value = SAMPLE_HTML;

  function runMobileFriendlinessAudit(html) {
    const audits = [];
    let score = 0;

    // 1. Viewport Meta Check (25 pts)
    const viewportRegex = /<meta[^>]*name=["']viewport["'][^>]*>/i;
    const viewportMatch = html.match(viewportRegex);
    
    if (viewportMatch) {
      const content = viewportMatch[0];
      const hasDeviceWidth = /width\s*=\s*device-width/i.test(content);
      const hasInitialScale = /initial-scale\s*=\s*[0-9.]+/i.test(content);

      if (hasDeviceWidth && hasInitialScale) {
        score += 25;
        audits.push({
          pass: true,
          title: "Viewport Meta Tag Configured Correctly",
          desc: "We found '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">'. This configures the browser to scale pages appropriately for all mobile screens."
        });
      } else {
        score += 10;
        audits.push({
          pass: false,
          title: "Viewport Meta Tag Needs Tuning",
          desc: "Viewport tag was found but is missing 'width=device-width' or 'initial-scale=1.0'. Mobile browsers might scale your site incorrectly."
        });
      }
    } else {
      audits.push({
        pass: false,
        title: "Viewport Meta Tag Missing",
        desc: "CRITICAL: No viewport meta tag found in your HTML head. Mobile devices will render this page as a full-size desktop screen, resulting in tiny, unreadable text."
      });
    }

    // 2. CSS Media Queries Check (25 pts)
    const hasMediaQueries = /@media/i.test(html) || /<link[^>]*media=/i.test(html);
    if (hasMediaQueries) {
      score += 25;
      audits.push({
        pass: true,
        title: "Responsive CSS Media Queries Found",
        desc: "We detected '@media' stylesheet declarations. This means your styles change styling properties dynamically depending on device screen sizes."
      });
    } else {
      audits.push({
        pass: false,
        title: "No Media Queries Detected",
        desc: "We could not find any CSS @media queries. Responsiveness requires media queries to adapt columns, fonts, and spacing variables for small viewports."
      });
    }

    // 3. Old Table Layouts Check (15 pts)
    // Check if table tags are present without tabular headers (suspected layout tables)
    const tableMatches = html.match(/<table/gi) || [];
    const thMatches = html.match(/<th/gi) || [];
    const hasOldTables = tableMatches.length > 0 && thMatches.length === 0;

    if (!hasOldTables) {
      score += 15;
      audits.push({
        pass: true,
        title: "No Legacy Table Layouts",
        desc: "We did not find any layout tables. Using HTML tables for grids impairs fluid screen sizing. CSS Flexbox and Grid are preferred."
      });
    } else {
      audits.push({
        pass: false,
        title: "Potential Table-Based Layout Detected",
        desc: "We found HTML table elements without standard table header cells. Table layouts do not scale responsively on mobile screens."
      });
    }

    // 4. Absolute Hardcoded Widths Check (15 pts)
    // Search for inline px widths that exceed common mobile bounds (e.g. width: 600px, width="800")
    const absoluteWidthMatch = html.match(/width[:=]["']?\s*(?:[5-9]\d{2}|\d{4,})px/i) || html.match(/width=["']\s*(?:[5-9]\d{2}|\d{4,})\s*["']/i);
    if (!absoluteWidthMatch) {
      score += 15;
      audits.push({
        pass: true,
        title: "Fluid Layout Widths Active",
        desc: "No large absolute widths (e.g. width: 800px) found. Your grid components appear to scale proportionally or use fluid CSS percentages."
      });
    } else {
      audits.push({
        pass: false,
        title: "Absolute Pixel Widths Hardcoded",
        desc: "We detected absolute pixel widths exceeding 500px in your HTML/CSS. This causes horizontal scrolling issues on modern smartphone displays."
      });
    }

    // 5. Mixed Content & Secure HTTPS Assets Check (20 pts)
    const hasHttpAssets = /src=["']http:\/\//i.test(html) || /href=["']http:\/\//i.test(html);
    if (!hasHttpAssets) {
      score += 20;
      audits.push({
        pass: true,
        title: "Secure HTTPS Asset Protocols",
        desc: "All linked stylesheets, images, and external script assets are secure (or protocol-relative), preventing mixed content security warning prompts."
      });
    } else {
      audits.push({
        pass: false,
        title: "Insecure Assets Found (Mixed Content)",
        desc: "We identified assets loaded via insecure 'http://' protocols. Mobile browsers block insecure mixed content on SSL encrypted pages."
      });
    }

    return { score, audits };
  }

  function renderAuditResults(htmlText) {
    const { score, audits } = runMobileFriendlinessAudit(htmlText);

    // Update Circle loader
    scoreValue.textContent = `${score}%`;
    const offset = 314 - (314 * score) / 100;
    scoreFill.style.strokeDashoffset = offset;

    // Update Circle Fill Color depending on score ranges
    if (score >= 80) {
      scoreFill.style.stroke = "var(--color-green)";
      scoreTitle.textContent = "Excellent Mobile Readiness!";
      scoreSummary.textContent = "Your page is optimized for mobile browser indexing. Viewport parameters, secure asset links, and responsive queries pass checklists.";
    } else if (score >= 50) {
      scoreFill.style.stroke = "var(--color-primary)";
      scoreTitle.textContent = "Modest Mobile Responsiveness";
      scoreSummary.textContent = "Your site can be viewed on mobile devices, but some design elements could cause rendering flaws. Review failed indicators below.";
    } else {
      scoreFill.style.stroke = "var(--color-red)";
      scoreTitle.textContent = "Poor Mobile Friendliness";
      scoreSummary.textContent = "Critical responsive elements are missing. Mobile visitors will experience rendering errors, cut-off grids, and microscopic sizes.";
    }

    // Pop checklist
    auditContainer.innerHTML = "";
    audits.forEach(audit => {
      const div = document.createElement("div");
      div.className = "audit-item";
      div.innerHTML = `
        <div class="audit-icon ${audit.pass ? "audit-icon-pass" : "audit-icon-fail"}">
          ${audit.pass ? "✓" : "✗"}
        </div>
        <div>
          <div class="audit-title">${audit.title}</div>
          <div class="audit-desc">${audit.desc}</div>
        </div>
      `;
      auditContainer.appendChild(div);
    });

    resultsSection.style.display = "block";
  }

  btnTest.addEventListener("click", () => {
    const htmlCode = input.value.trim();
    if (!htmlCode) {
      showToast("Please enter some HTML source code first.", "warning");
      return;
    }
    renderAuditResults(htmlCode);
    showToast("Audit completed!", "success");
  });

  btnClear.addEventListener("click", () => {
    input.value = "";
    resultsSection.style.display = "none";
    showToast("Cleared", "success");
  });

  // Run initial audit on load
  renderAuditResults(SAMPLE_HTML);
});
