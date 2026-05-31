document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileStatus = document.getElementById("file-status");
  
  const topText = document.getElementById("top-text");
  const bottomText = document.getElementById("bottom-text");
  
  const fontSizeSlider = document.getElementById("font-size");
  const valFontSize = document.getElementById("val-font-size");
  const optUppercase = document.getElementById("opt-uppercase");
  
  const textColor = document.getElementById("text-color");
  const strokeColor = document.getElementById("stroke-color");
  
  const canvasPreview = document.getElementById("canvas-preview");
  const noCanvasText = document.getElementById("no-canvas-text");
  const btnDownload = document.getElementById("btn-download");

  let memeImage = null; // HTML Image element

  function drawMeme() {
    if (!memeImage) return;

    const ctx = canvasPreview.getContext("2d");

    // Set canvas dimensions equal to raw base image resolution
    canvasPreview.width = memeImage.width;
    canvasPreview.height = memeImage.height;

    // Draw base image
    ctx.drawImage(memeImage, 0, 0);

    // Apply styles
    const size = parseInt(fontSizeSlider.value);
    ctx.font = `${size}px Impact, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = textColor.value;
    ctx.strokeStyle = strokeColor.value;
    
    // Set stroke outline width proportional to font size
    ctx.lineWidth = Math.max(3, Math.round(size / 6));
    ctx.lineJoin = "round";

    // Read texts and format
    let top = topText.value.trim();
    let bottom = bottomText.value.trim();

    if (optUppercase.checked) {
      top = top.toUpperCase();
      bottom = bottom.toUpperCase();
    }

    const margin = Math.max(20, Math.round(memeImage.height * 0.04));
    const maxWidth = memeImage.width - margin * 2;

    // Recursive text wrapping helper
    function drawWrappedText(text, x, y, isBottom) {
      const words = text.split(" ");
      const lines = [];
      let currentLine = "";

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + " " + words[i] : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      if (isBottom) {
        // Draw bottom lines upwards
        for (let i = lines.length - 1; i >= 0; i--) {
          const lineY = y - (lines.length - 1 - i) * (size * 1.1);
          ctx.strokeText(lines[i], x, lineY);
          ctx.fillText(lines[i], x, lineY);
        }
      } else {
        // Draw top lines downwards
        for (let i = 0; i < lines.length; i++) {
          const lineY = y + i * (size * 1.1);
          ctx.strokeText(lines[i], x, lineY);
          ctx.fillText(lines[i], x, lineY);
        }
      }
    }

    if (top) {
      drawWrappedText(top, memeImage.width / 2, margin + size, false);
    }
    if (bottom) {
      drawWrappedText(bottom, memeImage.width / 2, memeImage.height - margin - 10, true);
    }
  }

  // Hook up inputs
  [topText, bottomText, textColor, strokeColor, optUppercase].forEach(el => {
    el.addEventListener("input", drawMeme);
  });

  fontSizeSlider.addEventListener("input", () => {
    valFontSize.textContent = `${fontSizeSlider.value}px`;
    drawMeme();
  });

  function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        memeImage = img;
        fileStatus.textContent = `${img.width}x${img.height} px`;
        noCanvasText.style.display = "none";
        canvasPreview.style.display = "block";
        btnDownload.disabled = false;
        drawMeme();
        showToast("Image loaded! Ready for captioning.", "success");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--color-primary)";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "";
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "";
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  btnDownload.addEventListener("click", () => {
    if (!memeImage) return;

    try {
      const url = canvasPreview.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "custom_meme.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!", "success");
    } catch (e) {
      showToast("Download failed: " + e.message, "error");
    }
  });
});
