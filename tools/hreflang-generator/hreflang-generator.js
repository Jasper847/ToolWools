document.addEventListener("DOMContentLoaded", () => {
  const defaultUrl = document.getElementById("default-url");
  const hreflangList = document.getElementById("hreflang-list");
  const btnAddRow = document.getElementById("btn-add-row");
  const btnGenerate = document.getElementById("btn-generate");
  const btnClear = document.getElementById("btn-clear");
  
  const outputHtml = document.getElementById("output-html");
  const outputXml = document.getElementById("output-xml");

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "it", name: "Italian (Italiano)" },
    { code: "zh", name: "Chinese (中文)" },
    { code: "ja", name: "Japanese (日本語)" },
    { code: "pt", name: "Portuguese (Português)" },
    { code: "ru", name: "Russian (Русский)" },
    { code: "ar", name: "Arabic (العربية)" },
    { code: "hi", name: "Hindi (हिन्दी)" }
  ];

  const countries = [
    { code: "", name: "Any Country (Language only)" },
    { code: "x-default", name: "x-default (Default Fallback)" },
    { code: "us", name: "United States" },
    { code: "gb", name: "United Kingdom" },
    { code: "es", name: "Spain" },
    { code: "mx", name: "Mexico" },
    { code: "fr", name: "France" },
    { code: "de", name: "Germany" },
    { code: "ca", name: "Canada" },
    { code: "au", name: "Australia" },
    { code: "br", name: "Brazil" },
    { code: "cn", name: "China" },
    { code: "jp", name: "Japan" }
  ];

  let rowCounter = 0;

  function createRow(initialLang = "en", initialCountry = "x-default", initialUrl = "") {
    const rowId = `hreflang-row-${rowCounter++}`;
    const div = document.createElement("div");
    div.className = "hreflang-row";
    div.id = rowId;

    let langOptions = languages.map(l => `<option value="${l.code}" ${l.code === initialLang ? "selected" : ""}>${l.name} [${l.code}]</option>`).join("");
    let countryOptions = countries.map(c => `<option value="${c.code}" ${c.code === initialCountry ? "selected" : ""}>${c.name} ${c.code ? `[${c.code}]` : ""}</option>`).join("");

    div.innerHTML = `
      <select class="tool-select select-lang" style="flex:1; min-width:140px">
        ${langOptions}
      </select>
      <select class="tool-select select-country" style="flex:1; min-width:160px">
        ${countryOptions}
      </select>
      <input type="url" class="tool-input input-url" placeholder="Alternate URL" value="${initialUrl}" style="flex:2; min-width:200px">
      <button class="btn btn-secondary btn-remove-row" style="color:var(--color-red); border-color:var(--color-red-light); padding:8px 12px">✖</button>
    `;

    div.querySelector(".btn-remove-row").addEventListener("click", () => {
      div.remove();
      if (hreflangList.children.length === 0) {
        outputHtml.value = "";
        outputXml.value = "";
      }
    });

    hreflangList.appendChild(div);
  }

  // Pre-fill standard rows on load
  const base = defaultUrl.value.trim();
  createRow("en", "x-default", base);
  createRow("en", "us", `${base}/us/`);
  createRow("es", "es", `${base}/es/`);

  btnAddRow.addEventListener("click", () => {
    createRow("en", "", "");
  });

  btnGenerate.addEventListener("click", () => {
    const base = defaultUrl.value.trim();
    if (!base) {
      showToast("Please enter a base website URL.", "warning");
      return;
    }

    const rows = hreflangList.querySelectorAll(".hreflang-row");
    if (rows.length === 0) {
      showToast("Please add at least one alternate page row.", "warning");
      return;
    }

    let htmlLines = [];
    let xmlLines = [];

    rows.forEach(row => {
      const lang = row.querySelector(".select-lang").value;
      const country = row.querySelector(".select-country").value;
      let url = row.querySelector(".input-url").value.trim();

      if (!url) url = base; // Fallback to base URL if empty

      let code = "";
      if (country === "x-default") {
        code = "x-default";
      } else if (country) {
        code = `${lang}-${country.toLowerCase()}`;
      } else {
        code = lang;
      }

      htmlLines.push(`<link rel="alternate" hreflang="${code}" href="${url}" />`);
      xmlLines.push(`  <xhtml:link rel="alternate" hreflang="${code}" href="${url}" />`);
    });

    outputHtml.value = htmlLines.join("\n");
    
    // Format XML Sitemap alternate tags wrapper
    const xmlWrapper = `<url>\n  <loc>${base}</loc>\n${xmlLines.join("\n")}\n</url>`;
    outputXml.value = xmlWrapper;

    showToast("Hreflang tags generated successfully!", "success");
  });

  btnClear.addEventListener("click", () => {
    hreflangList.innerHTML = "";
    outputHtml.value = "";
    outputXml.value = "";
    showToast("Cleared", "success");
  });
});
