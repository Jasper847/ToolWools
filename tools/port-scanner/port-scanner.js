document.addEventListener("DOMContentLoaded", () => {
  const hostInput = document.getElementById("host-input");
  const serverProfile = document.getElementById("server-profile");
  const scanSpeed = document.getElementById("scan-speed");
  const terminal = document.getElementById("terminal");
  const portContainer = document.getElementById("port-container");

  const btnStart = document.getElementById("btn-start");
  const btnStop = document.getElementById("btn-stop");
  const btnClearConsole = document.getElementById("btn-clear-console");

  const portsToScan = [
    { port: 21, service: "FTP" },
    { port: 22, service: "SSH" },
    { port: 23, service: "Telnet" },
    { port: 25, service: "SMTP" },
    { port: 53, service: "DNS" },
    { port: 80, service: "HTTP" },
    { port: 110, service: "POP3" },
    { port: 135, service: "RPC" },
    { port: 139, service: "NetBIOS" },
    { port: 143, service: "IMAP" },
    { port: 443, service: "HTTPS" },
    { port: 445, service: "SMB" },
    { port: 1433, service: "MSSQL" },
    { port: 3306, service: "MySQL" },
    { port: 3389, service: "RDP" },
    { port: 5432, service: "PostgreSQL" },
    { port: 6379, service: "Redis" },
    { port: 8080, service: "HTTP-Alt" },
    { port: 27017, service: "MongoDB" }
  ];

  let scanActive = false;
  let currentScanTimeout = null;

  function initPortGrid() {
    portContainer.innerHTML = "";
    portsToScan.forEach(item => {
      const div = document.createElement("div");
      div.className = "port-item";
      div.id = `port-card-${item.port}`;
      div.innerHTML = `
        <span class="port-status-dot dot-filtered" id="dot-${item.port}"></span>
        <div>
          <div style="font-weight:700">Port ${item.port}</div>
          <div style="font-size:11px;color:var(--color-muted)">${item.service}</div>
        </div>
      `;
      portContainer.appendChild(div);
    });
  }

  function addLog(text, type = "") {
    const line = document.createElement("div");
    line.className = "terminal-line";
    if (type) line.classList.add(`terminal-${type}`);
    line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function getPortStatus(port, profile) {
    if (profile === "web") {
      if ([80, 443, 8080, 22].includes(port)) return "open";
      if ([21, 23, 25, 110, 143].includes(port)) return "filtered";
      return "closed";
    }
    if (profile === "db") {
      if ([3306, 5432, 6379, 27017, 22].includes(port)) return "open";
      if ([80, 443].includes(port)) return "closed";
      return "filtered";
    }
    if (profile === "mail") {
      if ([25, 110, 143, 80, 443].includes(port)) return "open";
      if ([21, 22].includes(port)) return "filtered";
      return "closed";
    }
    if (profile === "secure") {
      if (port === 443) return "open";
      if (port === 22) return "filtered";
      return "filtered";
    }
    // Random profile
    const rand = Math.random();
    if (rand < 0.25) return "open";
    if (rand < 0.7) return "closed";
    return "filtered";
  }

  function getDelay() {
    const sp = scanSpeed.value;
    if (sp === "fast") return 50;
    if (sp === "medium") return 150;
    return 400; // stealth
  }

  function runScan() {
    const host = hostInput.value.trim();
    if (!host) {
      showToast("Please enter a target IP or host address.", "warning");
      return;
    }

    scanActive = true;
    btnStart.disabled = true;
    btnStop.disabled = false;
    initPortGrid();

    addLog(`Initiating port scan on target host: ${host}...`, "warn");
    addLog(`Scan mode: TCP SYN (Half-open Connection Simulation)`, "");
    addLog(`Loading profile: ${serverProfile.options[serverProfile.selectedIndex].text}`, "");

    let index = 0;
    let openCount = 0;
    let closedCount = 0;
    let filteredCount = 0;

    const delay = getDelay();

    function scanNextPort() {
      if (!scanActive) return;

      if (index >= portsToScan.length) {
        // Scan complete
        addLog(`Scan completed on host: ${host}`, "success");
        addLog(`Results: ${openCount} open, ${closedCount} closed, ${filteredCount} filtered ports.`, "success");
        showToast("Port scan complete!", "success");
        btnStart.disabled = false;
        btnStop.disabled = true;
        scanActive = false;
        document.getElementById("stat-scan-progress").textContent = "100%";
        return;
      }

      const item = portsToScan[index];
      addLog(`Scanning Port ${item.port} (${item.service})...`);

      const status = getPortStatus(item.port, serverProfile.value);

      currentScanTimeout = setTimeout(() => {
        // Update port visual card
        const card = document.getElementById(`port-card-${item.port}`);
        const dot = document.getElementById(`dot-${item.port}`);

        card.className = `port-item ${status}`;
        dot.className = `port-status-dot dot-${status}`;

        if (status === "open") {
          openCount++;
          addLog(`--> Port ${item.port} is OPEN (${item.service} active service detected)`, "success");
        } else if (status === "closed") {
          closedCount++;
        } else {
          filteredCount++;
          addLog(`--> Port ${item.port} is FILTERED (no reply, host firewall suspected)`, "warn");
        }

        // Update stats
        document.getElementById("stat-ports-open").textContent = openCount;
        document.getElementById("stat-ports-closed").textContent = closedCount;
        document.getElementById("stat-ports-filtered").textContent = filteredCount;

        const progressPercent = Math.round(((index + 1) / portsToScan.length) * 100);
        document.getElementById("stat-scan-progress").textContent = `${progressPercent}%`;

        index++;
        scanNextPort();
      }, delay);
    }

    scanNextPort();
  }

  btnStart.addEventListener("click", runScan);

  btnStop.addEventListener("click", () => {
    if (scanActive) {
      scanActive = false;
      clearTimeout(currentScanTimeout);
      addLog("Port scan halted by user.", "error");
      showToast("Scan stopped.", "warning");
      btnStart.disabled = false;
      btnStop.disabled = true;
    }
  });

  btnClearConsole.addEventListener("click", () => {
    terminal.innerHTML = "";
    addLog("Console log cleared.");
  });

  initPortGrid();
});
