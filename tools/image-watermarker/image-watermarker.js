document.addEventListener("DOMContentLoaded", () => {
  const fileBase = document.getElementById("file-base");
  const fileLogo = document.getElementById("file-logo");
  const baseStatus = document.getElementById("base-status");
  const typeText = document.getElementById("type-text");
  const typeLogo = document.getElementById("type-logo");
  const textSection = document.getElementById("text-controls-section");
  const logoSection = document.getElementById("logo-controls-section");

  const watermarkText = document.getElementById("watermark-text");
  const fontFamily = document.getElementById("font-family");
  const textColor = document.getElementById("text-color");

  const scaleSlider = document.getElementById("scale-slider");
  const valScale = document.getElementById("val-scale");
  const opacitySlider = document.getElementById("opacity-slider");
  const valOpacity = document.getElementById("val-opacity");

  const positionGrid = document.getElementById("position-grid");
  const canvasPreview = document.getElementById("canvas-preview");
  const noCanvasText = document.getElementById("no-canvas-text");
  const btnDownload = document.getElementById("btn-download");

  let baseImage = null;
  let logoImage = null;
  let currentType = "text"; // "text" | "logo"
  let currentPosition = "bottom-right";

  // Position Grid selection
  positionGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("position-cell")) {
      positionGrid.querySelectorAll(".position-cell").forEach(c => c.classList.remove("active"));
      e.target.classList.add("active");
      currentPosition = e.target.getAttribute("data-pos");
      updateWatermark();
    }
  });

  // Toggle Text / Logo
  typeText.addEventListener("click", () => {
    typeText.classList.add("active");
    typeLogo.classList.remove("active");
    textSection.style.display = "block";
    logoSection.style.display = "none";
    currentType = "text";
    updateWatermark();
  });

  typeLogo.addEventListener("click", () => {
    typeLogo.classList.add("active");
    typeText.classList.remove("active");
    logoSection.style.display = "block";
    textSection.style.display = "none";
    currentType = "logo";
    updateWatermark();
  });

  // Slider events
  scaleSlider.addEventListener("input", () => {
    valScale.textContent = `${scaleSlider.value}%`;
    updateWatermark();
  });
  opacitySlider.addEventListener("input", () => {
    valOpacity.textContent = `${opacitySlider.value}%`;
    updateWatermark();
  });

  // Text inputs
  watermarkText.addEventListener("input", updateWatermark);
  fontFamily.addEventListener("change", updateWatermark);
  textColor.addEventListener("input", updateWatermark);

  // Upload Base Image
  fileBase.addEventListener("change", () => {
    if (fileBase.files.length > 0) {
      const file = fileBase.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          baseImage = img;
          baseStatus.textContent = `${img.width}x${img.height} px`;
          noCanvasText.style.display = "none";
          canvasPreview.style.display = "block";
          btnDownload.disabled = false;
          updateWatermark();
          showToast("Base image loaded!", "success");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Upload Logo Image
  fileLogo.addEventListener("change", () => {
    if (fileLogo.files.length > 0) {
      const file = fileLogo.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          logoImage = img;
          updateWatermark();
          showToast("Watermark logo loaded!", "success");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  function updateWatermark() {
    if (!baseImage) return;

    const ctx = canvasPreview.getContext("2d");
    
    // Set canvas dimensions identical to raw base image to preserve resolution quality
    canvasPreview.width = baseImage.width;
    canvasPreview.height = baseImage.height;

    // Draw base image
    ctx.drawImage(baseImage, 0, 0);

    const scale = parseInt(scaleSlider.value) / 100;
    const opacity = parseInt(opacitySlider.value) / 100;

    ctx.save();
    ctx.globalAlpha = opacity;

    let wWidth = 0;
    let wHeight = 0;
    let textStr = watermarkText.value.trim();
    let fontSize = 0;

    if (currentType === "text" && textStr) {
      // Calculate font size proportional to image height
      fontSize = Math.round(baseImage.height * 0.05 * (scale / 0.2));
      if (fontSize < 10) fontSize = 10;

      ctx.font = `bold ${fontSize}px ${fontFamily.value}`;
      wWidth = ctx.measureText(textStr).width;
      wHeight = fontSize;
    } else if (currentType === "logo" && logoImage) {
      // Calculate logo size proportional to base image
      const maxW = baseImage.width * scale;
      const aspect = logoImage.height / logoImage.width;
      wWidth = maxW;
      wHeight = maxW * aspect;
    }

    if (wWidth > 0 && wHeight > 0) {
      // Offset margin
      const margin = Math.max(16, Math.round(baseImage.width * 0.02));
      let x = 0;
      let y = 0;

      switch (currentPosition) {
        case "top-left":
          x = margin;
          y = margin + (currentType === "text" ? wHeight : 0);
          break;
        case "top-center":
          x = (baseImage.width - wWidth) / 2;
          y = margin + (currentType === "text" ? wHeight : 0);
          break;
        case "top-right":
          x = baseImage.width - wWidth - margin;
          y = margin + (currentType === "text" ? wHeight : 0);
          break;
        case "middle-left":
          x = margin;
          y = (baseImage.height - wHeight) / 2 + (currentType === "text" ? wHeight / 2 : 0);
          break;
        case "middle-center":
          x = (baseImage.width - wWidth) / 2;
          y = (baseImage.height - wHeight) / 2 + (currentType === "text" ? wHeight / 2 : 0);
          break;
        case "middle-right":
          x = baseImage.width - wWidth - margin;
          y = (baseImage.height - wHeight) / 2 + (currentType === "text" ? wHeight / 2 : 0);
          break;
        case "bottom-left":
          x = margin;
          y = baseImage.height - wHeight - margin + (currentType === "text" ? wHeight : 0);
          break;
        case "bottom-center":
          x = (baseImage.width - wWidth) / 2;
          y = baseImage.height - wHeight - margin + (currentType === "text" ? wHeight : 0);
          break;
        case "bottom-right":
          x = baseImage.width - wWidth - margin;
          y = baseImage.height - wHeight - margin + (currentType === "text" ? wHeight : 0);
          break;
      }

      if (currentType === "text") {
        ctx.fillStyle = textColor.value;
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4;
        ctx.fillText(textStr, x, y);
      } else if (currentType === "logo" && logoImage) {
        ctx.drawImage(logoImage, x, y, wWidth, wHeight);
      }
    }

    ctx.restore();
  }

  btnDownload.addEventListener("click", () => {
    if (!baseImage) return;

    try {
      const url = canvasPreview.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "watermarked_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!", "success");
    } catch (e) {
      showToast("Download failed: " + e.message, "error");
    }
  });
});
