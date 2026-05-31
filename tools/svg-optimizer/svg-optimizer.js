document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");
  const previewBox = document.getElementById("preview-box");

  const btnOptimize = document.getElementById("btn-optimize");
  const btnDownload = document.getElementById("btn-download");
  const btnCopy = document.getElementById("btn-copy");
  const btnClear = document.getElementById("btn-clear");

  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function roundStringNumbers(str) {
    // Round floats to 2 decimal places (e.g., 12.3456 -> 12.35)
    return str.replace(/-?\d+\.\d+/g, val => {
      const num = parseFloat(val);
      return String(Math.round(num * 100) / 100);
    });
  }

  function optimizeSVG(svgText, options) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(svgText, "image/svg+xml");

    // Check parser errors
    const parsererror = xmlDoc.getElementsByTagName("parsererror");
    if (parsererror.length > 0) {
      throw new Error("Invalid SVG syntax: " + (parsererror[0].textContent || "Parsing failed."));
    }

    const svgElement = xmlDoc.documentElement;
    if (!svgElement || svgElement.nodeName.toLowerCase() !== "svg") {
      throw new Error("Root element is not <svg>");
    }

    // 1. Remove comments and processing instructions
    if (options.removeComments) {
      const iterator = xmlDoc.createNodeIterator(
        xmlDoc,
        NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_OTHER,
        null
      );
      let node;
      const nodesToRemove = [];
      while ((node = iterator.nextNode())) {
        nodesToRemove.push(node);
      }
      nodesToRemove.forEach(n => n.parentNode && n.parentNode.removeChild(n));

      // Remove meta elements: metadata, desc, title
      const metaTags = ["metadata", "desc", "title"];
      metaTags.forEach(tag => {
        const elements = xmlDoc.getElementsByTagName(tag);
        for (let i = elements.length - 1; i >= 0; i--) {
          elements[i].parentNode.removeChild(elements[i]);
        }
      });
    }

    // 2. Handle dimensions vs viewBox
    if (options.keepViewBox) {
      const widthAttr = svgElement.getAttribute("width");
      const heightAttr = svgElement.getAttribute("height");
      const viewBoxAttr = svgElement.getAttribute("viewBox");

      if (widthAttr && heightAttr && !viewBoxAttr) {
        // Construct viewBox
        const w = parseFloat(widthAttr);
        const h = parseFloat(heightAttr);
        if (!isNaN(w) && !isNaN(h)) {
          svgElement.setAttribute("viewBox", `0 0 ${w} ${h}`);
        }
      }
      // Strip explicit width/height
      svgElement.removeAttribute("width");
      svgElement.removeAttribute("height");
    }

    // 3. Round numbers / compress coordinate precision recursively
    if (options.precisionRounding) {
      const allElements = xmlDoc.getElementsByTagName("*");
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i];
        for (let j = 0; j < el.attributes.length; j++) {
          const attr = el.attributes[j];
          // Round coordinate paths, coordinates, widths/heights, centers, points
          if (["d", "points", "dx", "dy", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "transform"].includes(attr.name)) {
            attr.value = roundStringNumbers(attr.value);
          }
        }
      }
    }

    // Serialize SVG back to text
    const serializer = new XMLSerializer();
    let optimizedText = serializer.serializeToString(xmlDoc);

    // Minor code compression tweaks
    optimizedText = optimizedText
      .replace(/\s*=\s*"/g, '="') // Remove spacing around attributes
      .trim();

    if (options.prettify) {
      // Very simple indentation prettify
      let formatted = "";
      let reg = /(>)(<)(\/*)/g;
      let markup = optimizedText.replace(reg, '$1\r\n$2$3');
      let pad = 0;
      markup.split('\r\n').forEach(line => {
        let indent = 0;
        if (line.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (line.match(/^<\/\w/)) {
          if (pad !== 0) pad -= 1;
        } else if (line.match(/^<\w([^>]*[^\/])?>$/)) {
          indent = 1;
        } else if (line.match(/^<\w[^>]*\/>$/)) {
          indent = 0;
        }
        formatted += "  ".repeat(pad) + line + "\r\n";
        pad += indent;
      });
      optimizedText = formatted.trim();
    } else {
      // Minified output: replace white space between tags
      optimizedText = optimizedText.replace(/>\s+</g, "><");
    }

    return optimizedText;
  }

  btnOptimize.addEventListener("click", () => {
    const rawSvg = input.value.trim();
    if (!rawSvg) {
      showToast("Please enter or upload SVG content.", "warning");
      return;
    }

    try {
      const options = {
        removeComments: document.getElementById("opt-comments").checked,
        keepViewBox: document.getElementById("opt-dimensions").checked,
        precisionRounding: document.getElementById("opt-precision").checked,
        prettify: document.getElementById("opt-prettify").checked
      };

      const result = optimizeSVG(rawSvg, options);
      output.value = result;

      // Render live preview
      previewBox.innerHTML = result;

      // Update stats
      const sizeIn = rawSvg.length;
      const sizeOut = result.length;
      document.getElementById("stat-original").textContent = formatBytes(sizeIn);
      document.getElementById("stat-optimized").textContent = formatBytes(sizeOut);

      const savings = Math.max(0, Math.round(((sizeIn - sizeOut) / sizeIn) * 100));
      document.getElementById("stat-savings").textContent = `${savings}%`;

      showToast("SVG optimized successfully!", "success");
    } catch (e) {
      showToast("Optimization failed: " + e.message, "error");
    }
  });

  btnCopy.addEventListener("click", () => {
    if (!output.value) {
      showToast("Optimize SVG first.", "warning");
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showToast("Copied optimized SVG!", "success");
    });
  });

  btnDownload.addEventListener("click", () => {
    const code = output.value;
    if (!code) {
      showToast("Optimize SVG first.", "warning");
      return;
    }

    try {
      const blob = new Blob([code], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "optimized.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!", "success");
    } catch (e) {
      showToast("Download failed: " + e.message, "error");
    }
  });

  btnClear.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    previewBox.innerHTML = '<span style="color: var(--color-muted); font-size: 14px;">Paste or upload SVG to see preview</span>';
    document.getElementById("stat-original").textContent = "0 B";
    document.getElementById("stat-optimized").textContent = "0 B";
    document.getElementById("stat-savings").textContent = "0%";
    showToast("Cleared", "success");
  });

  // Support file Drag-and-Drop
  input.addEventListener("dragover", e => {
    e.preventDefault();
    input.style.borderColor = "var(--color-primary)";
  });

  input.addEventListener("dragleave", () => {
    input.style.borderColor = "";
  });

  input.addEventListener("drop", e => {
    e.preventDefault();
    input.style.borderColor = "";
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".svg")) {
      const reader = new FileReader();
      reader.onload = evt => {
        input.value = evt.target.result;
        btnOptimize.click();
      };
      reader.readAsText(file);
    } else {
      showToast("Please drop a valid SVG file.", "warning");
    }
  });
});
