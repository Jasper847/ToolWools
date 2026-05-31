document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const previewSection = document.getElementById("preview-section");
  const decodedImage = document.getElementById("decoded-image");
  const btnDecode = document.getElementById("btn-decode");
  const btnClear = document.getElementById("btn-clear");
  const btnDownload = document.getElementById("btn-download");

  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function getDecodedSize(base64Str) {
    // Strip headers and whitespace to get raw base64 content length
    const cleanStr = base64Str.replace(/^data:image\/[a-z+]+;base64,/i, "").replace(/\s/g, "");
    let padding = 0;
    if (cleanStr.endsWith("==")) padding = 2;
    else if (cleanStr.endsWith("=")) padding = 1;
    return (cleanStr.length * 0.75) - padding;
  }

  function detectMimeType(base64Str) {
    let rawStr = base64Str.trim().replace(/\s/g, "");
    
    // Check for data URI prefix
    const dataUriMatch = rawStr.match(/^data:(image\/[a-zA-Z+-\.]+);base64,/i);
    if (dataUriMatch) {
      return dataUriMatch[1];
    }

    // Try signature detection of first characters
    // Remove potential URL encoding or noise
    const cleanRaw = rawStr.replace(/^[^A-Za-z0-9+/]*/, "");
    const firstChar = cleanRaw.charAt(0);
    
    if (firstChar === "/") return "image/jpeg";
    if (firstChar === "i") return "image/png";
    if (firstChar === "R") return "image/gif";
    if (firstChar === "U") return "image/webp";
    if (firstChar === "P") return "image/svg+xml";

    return "image/png"; // Default fallback
  }

  btnDecode.addEventListener("click", () => {
    let base64Text = input.value.trim();
    if (!base64Text) {
      showToast("Please paste a Base64 string first.", "warning");
      return;
    }

    try {
      const mime = detectMimeType(base64Text);
      const sizeBytes = getDecodedSize(base64Text);

      // Extract raw Base64 if data URI prefix exists
      let rawBase64 = base64Text;
      if (base64Text.startsWith("data:")) {
        const match = base64Text.match(/^data:image\/[a-z+]+;base64,(.+)$/i);
        if (match) rawBase64 = match[1];
      }

      const cleanSrc = `data:${mime};base64,${rawBase64.replace(/\s/g, "")}`;
      
      decodedImage.onload = () => {
        // Render stats
        document.getElementById("stat-length").textContent = rawBase64.length;
        document.getElementById("stat-size").textContent = formatBytes(sizeBytes);
        document.getElementById("stat-type").textContent = mime.replace("image/", "").toUpperCase();
        document.getElementById("stat-dimensions").textContent = `${decodedImage.naturalWidth} x ${decodedImage.naturalHeight}`;

        previewSection.style.display = "block";
        showToast("Base64 string successfully decoded to image!", "success");
      };

      decodedImage.onerror = () => {
        throw new Error("Unable to parse Base64 data. Invalid image encoding.");
      };

      decodedImage.src = cleanSrc;
    } catch (e) {
      showToast("Decoding failed: " + e.message, "error");
      previewSection.style.display = "none";
    }
  });

  btnDownload.addEventListener("click", () => {
    const src = decodedImage.src;
    if (!src) return;

    try {
      const mime = detectMimeType(input.value);
      const ext = mime.split("/")[1] || "png";
      const link = document.createElement("a");
      link.href = src;
      link.download = `decoded_image.${ext}`;
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
    previewSection.style.display = "none";
    decodedImage.src = "";
    document.getElementById("stat-length").textContent = "0";
    document.getElementById("stat-size").textContent = "0 B";
    document.getElementById("stat-type").textContent = "Unknown";
    document.getElementById("stat-dimensions").textContent = "0x0";
    showToast("Cleared", "success");
  });
});
