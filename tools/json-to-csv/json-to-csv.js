document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");

  function getSeparator() {
    const v = document.getElementById("separator").value;
    if (v === "tab") return "\t";
    return v;
  }

  function convertJSONToCSV(jsonText, separator, includeHeaders, quoteValues) {
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      throw new Error("Invalid JSON: " + e.message);
    }

    if (!Array.isArray(data)) {
      if (typeof data === "object" && data !== null) {
        data = [data];
      } else {
        throw new Error("JSON must be an array of objects, or a single object.");
      }
    }

    if (data.length === 0) {
      return { csv: "", rows: 0, cols: 0 };
    }

    // Identify unique headers across all records
    const headers = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
    if (headers.length === 0) {
      throw new Error("JSON objects do not contain any valid keys.");
    }

    const escapeVal = val => {
      if (val === null || val === undefined) return "";
      let str = typeof val === "object" ? JSON.stringify(val) : String(val);

      const hasQuotes = str.includes('"');
      const hasSeparator = str.includes(separator);
      const hasNewLines = str.includes("\n") || str.includes("\r");

      if (quoteValues || hasQuotes || hasSeparator || hasNewLines) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const lines = [];
    if (includeHeaders) {
      lines.push(headers.map(h => escapeVal(h)).join(separator));
    }

    data.forEach(obj => {
      const row = headers.map(h => escapeVal(obj[h]));
      lines.push(row.join(separator));
    });

    return {
      csv: lines.join("\n"),
      rows: data.length,
      cols: headers.length
    };
  }

  document.getElementById("btn-convert").addEventListener("click", () => {
    const jsonText = input.value.trim();
    if (!jsonText) {
      showToast("Please enter some JSON first.", "warning");
      return;
    }

    try {
      const separator = getSeparator();
      const includeHeaders = document.getElementById("opt-header").checked;
      const quoteValues = document.getElementById("opt-quote").checked;

      const { csv, rows, cols } = convertJSONToCSV(jsonText, separator, includeHeaders, quoteValues);

      output.value = csv;
      document.getElementById("stat-in").textContent = jsonText.length;
      document.getElementById("stat-out").textContent = csv.length;
      document.getElementById("stat-rows").textContent = rows;
      document.getElementById("stat-cols").textContent = cols;

      showToast("JSON converted to CSV successfully!", "success");
    } catch (e) {
      showToast(e.message, "error");
    }
  });

  document.getElementById("btn-copy").addEventListener("click", () => {
    if (!output.value) {
      showToast("Convert JSON first.", "warning");
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showToast("CSV copied to clipboard!", "success");
    });
  });

  document.getElementById("btn-download").addEventListener("click", () => {
    const csvContent = output.value;
    if (!csvContent) {
      showToast("Convert JSON to CSV first.", "warning");
      return;
    }

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "converted_data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("CSV download started!", "success");
    } catch (e) {
      showToast("Download failed: " + e.message, "error");
    }
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    ["stat-in", "stat-out", "stat-rows", "stat-cols"].forEach(id => {
      document.getElementById(id).textContent = "0";
    });
    showToast("Cleared", "success");
  });

  input.addEventListener("input", () => {
    document.getElementById("stat-in").textContent = input.value.length;
  });
});
