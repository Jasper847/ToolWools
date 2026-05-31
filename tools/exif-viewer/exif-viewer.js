document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileInfoRow = document.getElementById("file-info-row");
  const fileName = document.getElementById("file-name");
  const fileInfoText = document.getElementById("file-info-text");
  const btnRemove = document.getElementById("btn-remove");
  const resultsWrapper = document.getElementById("results-wrapper");
  const previewImage = document.getElementById("preview-image");

  function resetFields() {
    const fields = [
      "make", "model", "lens", "software", "aperture",
      "exposure", "iso", "focal", "flash", "program",
      "date-taken", "date-modified", "lat", "lng", "map"
    ];
    fields.forEach(f => {
      const el = document.getElementById(`val-${f}`);
      if (el) el.innerHTML = "—";
    });
  }

  function formatExposure(exposure) {
    if (!exposure) return "—";
    if (typeof exposure === "number") {
      if (exposure >= 1) return `${exposure} sec`;
      return `1/${Math.round(1 / exposure)} sec`;
    }
    // Handle fraction object representation
    if (exposure.denominator && exposure.numerator) {
      if (exposure.numerator >= exposure.denominator) {
        return `${(exposure.numerator / exposure.denominator).toFixed(1)} sec`;
      }
      return `${exposure.numerator}/${exposure.denominator} sec`;
    }
    return String(exposure);
  }

  function formatFraction(val) {
    if (!val) return "—";
    if (typeof val === "number") return val.toFixed(1);
    if (val.denominator && val.numerator) {
      return (val.numerator / val.denominator).toFixed(1);
    }
    return String(val);
  }

  function convertDMSToDD(dms, ref) {
    if (!dms || dms.length < 3) return null;
    
    const parseRational = (val) => {
      if (typeof val === "number") return val;
      if (val.denominator && val.numerator) return val.numerator / val.denominator;
      return 0;
    };

    const degrees = parseRational(dms[0]);
    const minutes = parseRational(dms[1]);
    const seconds = parseRational(dms[2]);

    let dd = degrees + (minutes / 60) + (seconds / 3600);
    if (ref === "S" || ref === "W") {
      dd = -dd;
    }
    return dd;
  }

  function parseMetadata(imgElement) {
    resetFields();
    
    // Check if EXIF is loaded
    if (!window.EXIF) {
      showToast("EXIF library did not load correctly.", "error");
      return;
    }

    window.EXIF.getData(imgElement, function () {
      const tags = window.EXIF.getAllTags(this);

      if (Object.keys(tags).length === 0) {
        showToast("No EXIF metadata tags found in this photo.", "warning");
      } else {
        showToast("EXIF data successfully loaded!", "success");
      }

      // 1. Camera Info
      if (tags.Make) document.getElementById("val-make").textContent = tags.Make;
      if (tags.Model) document.getElementById("val-model").textContent = tags.Model;
      
      const lens = tags.LensModel || tags.LensInfo || tags.UndefinedTag_0xA434;
      if (lens) document.getElementById("val-lens").textContent = lens;
      if (tags.Software) document.getElementById("val-software").textContent = tags.Software;

      // 2. Shooting settings
      if (tags.FNumber) {
        const fnum = formatFraction(tags.FNumber);
        document.getElementById("val-aperture").textContent = `f/${fnum}`;
      } else if (tags.ApertureValue) {
        document.getElementById("val-aperture").textContent = `f/${formatFraction(tags.ApertureValue)}`;
      }

      if (tags.ExposureTime) {
        document.getElementById("val-exposure").textContent = formatExposure(tags.ExposureTime);
      }
      
      if (tags.ISOSpeedRatings) {
        document.getElementById("val-iso").textContent = tags.ISOSpeedRatings;
      }
      
      if (tags.FocalLength) {
        document.getElementById("val-focal").textContent = `${formatFraction(tags.FocalLength)} mm`;
      }
      
      if (tags.Flash) {
        document.getElementById("val-flash").textContent = tags.Flash;
      }
      
      if (tags.ExposureProgram) {
        document.getElementById("val-program").textContent = tags.ExposureProgram;
      }

      // 3. Timestamps
      if (tags.DateTimeOriginal) {
        document.getElementById("val-date-taken").textContent = tags.DateTimeOriginal;
      }
      if (tags.DateTime) {
        document.getElementById("val-date-modified").textContent = tags.DateTime;
      }

      // 4. GPS Coordinates
      const lat = convertDMSToDD(tags.GPSLatitude, tags.GPSLatitudeRef);
      const lng = convertDMSToDD(tags.GPSLongitude, tags.GPSLongitudeRef);

      if (lat !== null && lng !== null) {
        document.getElementById("val-lat").textContent = `${lat.toFixed(6)}° ${tags.GPSLatitudeRef || ""}`;
        document.getElementById("val-lng").textContent = `${lng.toFixed(6)}° ${tags.GPSLongitudeRef || ""}`;
        
        const mapCell = document.getElementById("val-map");
        mapCell.innerHTML = `
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" 
             target="_blank" 
             class="btn btn-secondary" 
             style="font-size:11px; padding: 4px 8px; display:inline-flex; align-items:center; gap:4px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            Open in Google Maps
          </a>
        `;
      }
    });
  }

  function handleFile(file) {
    if (!file) return;

    fileName.textContent = file.name;
    fileInfoText.textContent = `${Math.round(file.size / 1024)} KB`;
    fileInfoRow.style.display = "flex";
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      resultsWrapper.style.display = "block";
      
      // Delay parsing slightly until image has loaded
      previewImage.onload = () => {
        parseMetadata(previewImage);
      };
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

  btnRemove.addEventListener("click", () => {
    fileInput.value = "";
    fileInfoRow.style.display = "none";
    resultsWrapper.style.display = "none";
    previewImage.src = "";
    resetFields();
    showToast("Image removed.", "info");
  });
});
