document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const previewSandbox = document.getElementById("preview-sandbox");
  const presetSelector = document.getElementById("preset-selector");
  const btnConvert = document.getElementById("btn-convert");

  const INVOICE_TEMPLATE = `<div style="font-family: Arial, sans-serif; padding: 10px;">
  <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px;">
    <div>
      <h2 style="margin: 0; color: #1e3a8a;">INVOICE</h2>
      <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">#INV-2026-001</p>
    </div>
    <div style="text-align: right;">
      <h3 style="margin: 0; color: #333;">ToolWools Inc.</h3>
      <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">123 SaaS Street, Silicon Valley</p>
    </div>
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
    <div>
      <h4 style="margin: 0 0 8px 0; color: #555; font-size: 12px; letter-spacing: 0.05em;">BILLED TO:</h4>
      <p style="margin: 0; font-weight: bold; font-size: 15px;">Acme Corporation</p>
      <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">456 Tech Boulevard, New York</p>
    </div>
    <div style="text-align: right; font-size: 14px;">
      <p style="margin: 0;"><strong>Date:</strong> May 31, 2026</p>
      <p style="margin: 4px 0 0 0;"><strong>Due Date:</strong> June 30, 2026</p>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
    <thead>
      <tr style="background: #f3f4f6; border-bottom: 2px solid #ddd;">
        <th style="padding: 12px 10px; text-align: left; font-weight: bold;">Item Description</th>
        <th style="padding: 12px 10px; text-align: right; font-weight: bold; width: 80px;">Hours</th>
        <th style="padding: 12px 10px; text-align: right; font-weight: bold; width: 100px;">Rate</th>
        <th style="padding: 12px 10px; text-align: right; font-weight: bold; width: 120px;">Line Total</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 10px;">Enterprise SaaS Plan Custom API Integration</td>
        <td style="padding: 12px 10px; text-align: right;">40</td>
        <td style="padding: 12px 10px; text-align: right;">$150.00</td>
        <td style="padding: 12px 10px; text-align: right;">$6,000.00</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 10px;">Cloud Consulting &amp; Database Migration</td>
        <td style="padding: 12px 10px; text-align: right;">12</td>
        <td style="padding: 12px 10px; text-align: right;">$180.00</td>
        <td style="padding: 12px 10px; text-align: right;">$2,160.00</td>
      </tr>
    </tbody>
  </table>

  <div style="display: flex; justify-content: flex-end; font-size: 14px;">
    <div style="width: 250px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color:#666">Subtotal:</span>
        <span style="font-weight:600">$8,160.00</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span style="color:#666">Tax (10%):</span>
        <span style="font-weight:600">$816.00</span>
      </div>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 12px 0;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #1e3a8a;">
        <span>Total Due:</span>
        <span>$8,976.00</span>
      </div>
    </div>
  </div>
</div>`;

  const RESUME_TEMPLATE = `<div style="font-family: Arial, sans-serif; padding: 10px;">
  <div style="border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px;">
    <h1 style="margin: 0; color: #1e3a8a; font-size: 28px;">John Doe</h1>
    <h3 style="margin: 5px 0 0 0; color: #555; font-weight: normal;">Senior Full-Stack Engineer</h3>
    <p style="margin: 8px 0 0 0; color: #666; font-size: 13px;">john.doe@email.com | (555) 019-2834 | github.com/johndoe</p>
  </div>

  <div style="margin-bottom: 20px;">
    <h4 style="margin: 0 0 8px 0; color: #1e3a8a; border-bottom: 1px solid #ddd; padding-bottom: 4px; font-size: 12px; letter-spacing:0.05em">PROFESSIONAL SUMMARY</h4>
    <p style="margin: 0; line-height: 1.6; font-size: 13.5px; color: #333;">
      Results-driven Software Engineer with 8+ years of experience designing, building, and deploying robust SaaS platforms. Expert in Node.js, React, and cloud server scaling architectures. Passionate about engineering performance and clean code metrics.
    </p>
  </div>

  <div style="margin-bottom: 20px;">
    <h4 style="margin: 0 0 10px 0; color: #1e3a8a; border-bottom: 1px solid #ddd; padding-bottom: 4px; font-size: 12px; letter-spacing:0.05em">WORK EXPERIENCE</h4>
    
    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13.5px; margin-bottom:4px">
        <span>Lead Developer — TechCorp Solutions</span>
        <span style="font-weight: normal; color: #666; font-size:12px">2022 - Present</span>
      </div>
      <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 13px; color: #444; line-height: 1.5;">
        <li>Led a team of 6 engineers to build enterprise-tier document management system.</li>
        <li>Decreased query latency by 45% using Postgres optimization indexes and Redis caching.</li>
      </ul>
    </div>

    <div style="margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 13.5px; margin-bottom:4px">
        <span>Software Engineer — CloudWares</span>
        <span style="font-weight: normal; color: #666; font-size:12px">2018 - 2022</span>
      </div>
      <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 13px; color: #444; line-height: 1.5;">
        <li>Designed microservices architecture processing 5M daily requests.</li>
        <li>Built cross-platform API widgets used by over 200 external developers.</li>
      </ul>
    </div>
  </div>

  <div>
    <h4 style="margin: 0 0 8px 0; color: #1e3a8a; border-bottom: 1px solid #ddd; padding-bottom: 4px; font-size: 12px; letter-spacing:0.05em">CORE SKILLS</h4>
    <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.6;">
      <strong>Languages:</strong> JavaScript, TypeScript, HTML5, CSS3, SQL, Python<br>
      <strong>Frameworks &amp; Tools:</strong> React, Node.js, Express, PostgreSQL, Redis, AWS (S3, EC2), Git
    </p>
  </div>
</div>`;

  function updatePreview() {
    previewSandbox.innerHTML = input.value;
  }

  // Hook preset change
  presetSelector.addEventListener("change", () => {
    const val = presetSelector.value;
    if (val === "invoice") {
      input.value = INVOICE_TEMPLATE;
    } else if (val === "resume") {
      input.value = RESUME_TEMPLATE;
    } else {
      input.value = "<!-- Add your custom HTML & inline CSS styles here -->\n";
    }
    updatePreview();
  });

  input.addEventListener("input", updatePreview);

  // Initialize
  input.value = INVOICE_TEMPLATE;
  updatePreview();

  btnConvert.addEventListener("click", () => {
    if (!input.value.trim()) {
      showToast("Please write or select some HTML first.", "warning");
      return;
    }

    if (!window.html2canvas || !window.jspdf) {
      showToast("Required libraries did not load correctly.", "error");
      return;
    }

    btnConvert.disabled = true;
    btnConvert.textContent = "Converting to PDF...";

    const { jsPDF } = window.jspdf;

    // Snapshot visual container
    html2canvas(previewSandbox, {
      scale: 2.0, // Double scale for high-DPI text scaling sharpness
      useCORS: true,
      backgroundColor: "#ffffff"
    }).then(canvas => {
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 standard width in mm
      const pageHeight = 295; // A4 standard height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Draw first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle pagination/split boundaries for long templates
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("html_document.pdf");
      showToast("PDF document downloaded!", "success");
    }).catch(err => {
      showToast("Conversion failed: " + err.message, "error");
    }).finally(() => {
      btnConvert.disabled = false;
      btnConvert.textContent = "Export to PDF Document";
    });
  });
});
