import { GIFEncoder, quantize, applyPalette } from 'https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js';

document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const globalDelay = document.getElementById("global-delay");
  const gifWidth = document.getElementById("gif-width");
  const gifHeight = document.getElementById("gif-height");
  const frameContainer = document.getElementById("frame-container");

  const btnCreate = document.getElementById("btn-create");
  const btnClear = document.getElementById("btn-clear");
  
  const gifPreview = document.getElementById("gif-preview");
  const noGifText = document.getElementById("no-gif-text");
  const progressWrapper = document.getElementById("progress-wrapper");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const downloadRow = document.getElementById("download-row");
  const btnDownload = document.getElementById("btn-download");

  let frames = []; // Array of { id, file, src, img, delay }
  let nextFrameId = 0;
  let compiledBlob = null;

  function updateFrameList() {
    if (frames.length === 0) {
      frameContainer.innerHTML = `<div style="color: var(--color-muted); text-align: center; padding: 24px;">No frames uploaded yet</div>`;
      btnCreate.disabled = true;
      return;
    }

    btnCreate.disabled = false;
    frameContainer.innerHTML = "";

    frames.forEach((frame, idx) => {
      const row = document.createElement("div");
      row.className = "frame-row";
      row.innerHTML = `
        <div class="frame-thumbnail-wrap">
          <img src="${frame.src}" class="frame-thumb">
          <div class="frame-meta">
            <div>Frame ${idx + 1}</div>
            <div style="font-size:11px;color:var(--color-muted)">${frame.file.name}</div>
          </div>
        </div>
        <div class="frame-controls">
          <label style="font-size:12px;display:flex;align-items:center;gap:4px">
            Delay: 
            <input type="number" class="tool-input-sm frame-delay-input" data-id="${frame.id}" value="${frame.delay}" min="50" step="50" style="width: 70px;">
            ms
          </label>
          <button class="btn btn-secondary btn-move-up" data-id="${frame.id}" ${idx === 0 ? "disabled" : ""} style="padding: 4px 8px; font-size: 11px;">↑</button>
          <button class="btn btn-secondary btn-move-down" data-id="${frame.id}" ${idx === frames.length - 1 ? "disabled" : ""} style="padding: 4px 8px; font-size: 11px;">↓</button>
          <button class="btn btn-secondary btn-remove-frame" data-id="${frame.id}" style="padding: 4px 8px; font-size: 11px; color: var(--color-red); border-color: var(--color-red-light)">✖</button>
        </div>
      `;
      frameContainer.appendChild(row);
    });

    // Wire up events
    frameContainer.querySelectorAll(".frame-delay-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const f = frames.find(item => item.id === id);
        if (f) f.delay = Math.max(50, parseInt(e.target.value) || 50);
      });
    });

    frameContainer.querySelectorAll(".btn-move-up").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const idx = frames.findIndex(item => item.id === id);
        if (idx > 0) {
          const temp = frames[idx];
          frames[idx] = frames[idx - 1];
          frames[idx - 1] = temp;
          updateFrameList();
        }
      });
    });

    frameContainer.querySelectorAll(".btn-move-down").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const idx = frames.findIndex(item => item.id === id);
        if (idx < frames.length - 1) {
          const temp = frames[idx];
          frames[idx] = frames[idx + 1];
          frames[idx + 1] = temp;
          updateFrameList();
        }
      });
    });

    frameContainer.querySelectorAll(".btn-remove-frame").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        frames = frames.filter(item => item.id !== id);
        updateFrameList();
        showToast("Frame removed.", "info");
      });
    });
  }

  function handleFiles(filesList) {
    let promises = [];
    const currentGlobalDelay = parseInt(globalDelay.value) || 500;

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (!file.type.startsWith("image/")) continue;

      const p = new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            frames.push({
              id: nextFrameId++,
              file: file,
              src: e.target.result,
              img: img,
              delay: currentGlobalDelay
            });
            resolve();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
      promises.push(p);
    }

    Promise.all(promises).then(() => {
      updateFrameList();
      showToast(`${promises.length} frame(s) loaded!`, "success");
    });
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleFiles(fileInput.files);
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
      handleFiles(e.dataTransfer.files);
    }
  });

  globalDelay.addEventListener("change", () => {
    const val = Math.max(50, parseInt(globalDelay.value) || 500);
    frames.forEach(f => f.delay = val);
    updateFrameList();
  });

  btnClear.addEventListener("click", () => {
    frames = [];
    compiledBlob = null;
    updateFrameList();
    gifPreview.style.display = "none";
    gifPreview.src = "";
    noGifText.style.display = "block";
    downloadRow.style.display = "none";
    progressWrapper.style.display = "none";
    showToast("Cleared all frames.", "info");
  });

  btnCreate.addEventListener("click", async () => {
    if (frames.length === 0) return;

    const width = parseInt(gifWidth.value) || 320;
    const height = parseInt(gifHeight.value) || 320;

    btnCreate.disabled = true;
    btnClear.disabled = true;
    noGifText.style.display = "none";
    gifPreview.style.display = "none";
    progressWrapper.style.display = "block";

    try {
      const format = "rgb565"; // Using RGB565 for standard high-quality compression
      const encoder = new GIFEncoder();
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        
        // Show progress status
        progressText.textContent = `Processing frame ${i + 1} of ${frames.length}...`;
        progressFill.style.width = `${Math.round((i / frames.length) * 100)}%`;

        // Wait brief delay to allow UI refresh
        await new Promise(resolve => setTimeout(resolve, 30));

        // Draw frame onto resized canvas (aspect fill/cover style)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        const img = frame.img;
        const scale = Math.max(width / img.width, height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (width - w) / 2;
        const y = (height - h) / 2;
        
        ctx.drawImage(img, x, y, w, h);

        const pix = ctx.getImageData(0, 0, width, height).data;
        
        // gifenc core encoding: quantize and compile frame
        const palette = quantize(pix, 256, { format });
        const index = applyPalette(pix, palette, { format });

        encoder.writeFrame(index, width, height, {
          palette,
          delay: frame.delay,
          format
        });
      }

      progressText.textContent = "Finalizing GIF encoder...";
      progressFill.style.width = "100%";
      await new Promise(resolve => setTimeout(resolve, 50));

      encoder.finish();
      const buffer = encoder.bytes();
      compiledBlob = new Blob([buffer], { type: "image/gif" });

      const url = URL.createObjectURL(compiledBlob);
      gifPreview.src = url;
      gifPreview.style.display = "block";
      downloadRow.style.display = "block";
      progressWrapper.style.display = "none";

      showToast("Animated GIF created successfully!", "success");
    } catch (e) {
      showToast("Failed to compile GIF: " + e.message, "error");
      noGifText.style.display = "block";
      progressWrapper.style.display = "none";
    } finally {
      btnCreate.disabled = false;
      btnClear.disabled = false;
    }
  });

  btnDownload.addEventListener("click", () => {
    if (!compiledBlob) return;
    try {
      const url = URL.createObjectURL(compiledBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "animated_animation.gif";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Download started!", "success");
    } catch (e) {
      showToast("Download failed: " + e.message, "error");
    }
  });
});
