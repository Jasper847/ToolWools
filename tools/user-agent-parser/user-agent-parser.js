document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");

  function parseUA(ua) {
    const result = {
      browser: { name: "Unknown", version: "Unknown" },
      os: { name: "Unknown", version: "Unknown" },
      engine: { name: "Unknown", version: "Unknown" },
      device: { type: "Desktop", vendor: "Unknown", model: "Unknown" }
    };

    if (!ua) return result;

    // 1. Engine
    if (/Gecko\//.test(ua) && !/like Gecko/i.test(ua)) {
      result.engine.name = "Gecko";
      const match = ua.match(/rv:([^\s)]+)/);
      if (match) result.engine.version = match[1];
    } else if (/AppleWebKit\//.test(ua)) {
      result.engine.name = "WebKit";
      const match = ua.match(/AppleWebKit\/([^\s]+)/);
      if (match) result.engine.version = match[1];
      if (/Blink/i.test(ua) || (/Chrome/i.test(ua) && !/Edge/i.test(ua) && !/Apple/i.test(ua))) {
        result.engine.name = "Blink";
      }
    } else if (/Trident\//.test(ua)) {
      result.engine.name = "Trident";
      const match = ua.match(/Trident\/([^\s)]+)/);
      if (match) result.engine.version = match[1];
    }

    // 2. Browser
    if (/SamsungBrowser\//i.test(ua)) {
      result.browser.name = "Samsung Internet";
      result.browser.version = ua.match(/SamsungBrowser\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/Opera|OPR\//i.test(ua)) {
      result.browser.name = "Opera";
      result.browser.version = ua.match(/(?:Opera|OPR)\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/Edg\//i.test(ua)) {
      result.browser.name = "Microsoft Edge";
      result.browser.version = ua.match(/Edg\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/Chrome|CriOS/i.test(ua)) {
      result.browser.name = "Google Chrome";
      result.browser.version = ua.match(/(?:Chrome|CriOS)\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/Firefox|FxiOS/i.test(ua)) {
      result.browser.name = "Mozilla Firefox";
      result.browser.version = ua.match(/(?:Firefox|FxiOS)\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
      result.browser.name = "Apple Safari";
      result.browser.version = ua.match(/Version\/([^\s]+)/)?.[1] || "Unknown";
    } else if (/MSIE|Trident/i.test(ua)) {
      result.browser.name = "Internet Explorer";
      result.browser.version = ua.match(/(?:MSIE\s|rv:)([^\s)]+)/)?.[1] || "Unknown";
    }

    // 3. OS
    if (/Windows NT/i.test(ua)) {
      result.os.name = "Windows";
      const ver = ua.match(/Windows NT ([^\s;)]+)/)?.[1];
      const versions = {
        "10.0": "10 / 11",
        "6.3": "8.1",
        "6.2": "8",
        "6.1": "7",
        "6.0": "Vista",
        "5.1": "XP",
        "5.0": "2000"
      };
      result.os.version = ver ? (versions[ver] || ver) : "Unknown";
    } else if (/Macintosh/i.test(ua)) {
      result.os.name = "macOS";
      const ver = ua.match(/Mac OS X ([^\s;)]+)/)?.[1];
      result.os.version = ver ? ver.replace(/_/g, ".") : "Unknown";
    } else if (/Android/i.test(ua)) {
      result.os.name = "Android";
      result.os.version = ua.match(/Android\s([^\s;)]+)/)?.[1] || "Unknown";
      result.device.type = "Mobile";
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      result.os.name = "iOS";
      result.os.version = ua.match(/OS\s([^\s;)]+)/)?.[1]?.replace(/_/g, ".") || "Unknown";
      result.device.type = /iPad/i.test(ua) ? "Tablet" : "Mobile";
      result.device.vendor = "Apple";
    } else if (/CrOS/i.test(ua)) {
      result.os.name = "Chrome OS";
      result.os.version = "Unknown";
    } else if (/Linux/i.test(ua)) {
      result.os.name = "Linux";
      result.os.version = "Unknown";
    }

    // 4. Device
    if (result.device.type === "Mobile" || result.device.type === "Tablet") {
      const match = ua.match(/\(([^)]+)\)/);
      if (match) {
        const parts = match[1].split(";");
        if (result.os.name === "Android") {
          const modelPart = parts[parts.length - 1].trim();
          result.device.model = modelPart;
          if (/Samsung|SM-|GT-/i.test(modelPart)) result.device.vendor = "Samsung";
          else if (/Pixel/i.test(modelPart)) result.device.vendor = "Google";
          else if (/Huawei|HUA/i.test(modelPart)) result.device.vendor = "Huawei";
          else if (/Xiaomi|Mi\s|Redmi/i.test(modelPart)) result.device.vendor = "Xiaomi";
          else if (/OnePlus/i.test(modelPart)) result.device.vendor = "OnePlus";
        } else if (result.os.name === "iOS") {
          result.device.model = /iPad/i.test(ua) ? "iPad" : "iPhone";
        }
      }
    }

    return result;
  }

  function renderParserResults(uaString) {
    const res = parseUA(uaString);

    document.getElementById("res-browser").textContent = res.browser.name;
    document.getElementById("res-browser-ver").textContent = "Version: " + res.browser.version;

    document.getElementById("res-os").textContent = res.os.name;
    document.getElementById("res-os-ver").textContent = "Version: " + res.os.version;

    document.getElementById("res-engine").textContent = res.engine.name;
    document.getElementById("res-engine-ver").textContent = "Version: " + res.engine.version;

    document.getElementById("res-device").textContent = res.device.type;
    
    let modelLabel = "Model: Unknown";
    if (res.device.model !== "Unknown") {
      modelLabel = `Model: ${res.device.model}`;
      if (res.device.vendor !== "Unknown") {
        modelLabel += ` (${res.device.vendor})`;
      }
    } else if (res.device.vendor !== "Unknown") {
      modelLabel = `Vendor: ${res.device.vendor}`;
    }
    document.getElementById("res-device-model").textContent = modelLabel;
  }

  document.getElementById("btn-parse").addEventListener("click", () => {
    const uaString = input.value.trim();
    if (!uaString) {
      showToast("Please enter a User Agent string.", "warning");
      return;
    }
    renderParserResults(uaString);
    showToast("Parsed User Agent!", "success");
  });

  document.getElementById("btn-use-mine").addEventListener("click", () => {
    const myUA = navigator.userAgent;
    input.value = myUA;
    renderParserResults(myUA);
    showToast("Using your browser's User Agent", "success");
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    input.value = "";
    document.getElementById("res-browser").textContent = "Unknown";
    document.getElementById("res-browser-ver").textContent = "Version: Unknown";
    document.getElementById("res-os").textContent = "Unknown";
    document.getElementById("res-os-ver").textContent = "Version: Unknown";
    document.getElementById("res-engine").textContent = "Unknown";
    document.getElementById("res-engine-ver").textContent = "Version: Unknown";
    document.getElementById("res-device").textContent = "Desktop";
    document.getElementById("res-device-model").textContent = "Model: Unknown";
    showToast("Cleared", "success");
  });

  // Autofill with user's UA initially
  const initialUA = navigator.userAgent;
  input.value = initialUA;
  renderParserResults(initialUA);
});
