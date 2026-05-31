document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");

  function getIndent() {
    const v = document.getElementById("indent").value;
    if (v === "tab") return "\t";
    return " ".repeat(parseInt(v));
  }

  function countFunctions(js) {
    // Basic regex to find function keywords and arrow functions
    const cleaned = js.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "");
    const regularFuncs = (cleaned.match(/\bfunction\b/g) || []).length;
    const arrowFuncs = (cleaned.match(/=>/g) || []).length;
    return regularFuncs + arrowFuncs;
  }

  function minifyJS(js, preserveComments) {
    let result = js;
    if (!preserveComments) {
      // Remove multiline and single line comments
      result = result.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1");
    }
    // Simple compression (note: not a full compiler like Terser, but good client-side fallback)
    return result
      .replace(/\s+/g, " ")
      .replace(/\s*([=+\-*/%&|^<>!?:;.,{}()[\]])\s*/g, "$1")
      .trim();
  }

  document.getElementById("btn-format").addEventListener("click", () => {
    const jsText = input.value.trim();
    if (!jsText) {
      showToast("Please paste some JavaScript first.", "warning");
      return;
    }

    try {
      let formatted = "";
      const isMinify = document.getElementById("opt-minify").checked;
      const preserveComments = document.getElementById("opt-preserve-comments").checked;

      if (isMinify) {
        formatted = minifyJS(jsText, preserveComments);
      } else {
        const indentVal = getIndent();
        const options = {
          indent_size: indentVal === "\t" ? 1 : indentVal.length,
          indent_char: indentVal === "\t" ? "\t" : " ",
          preserve_newlines: true,
          space_after_anon_function: true,
          jslint_happy: false
        };

        if (window.js_beautify) {
          formatted = window.js_beautify(jsText, options);
          if (!preserveComments) {
            formatted = formatted.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1").trim();
          }
        } else {
          formatted = jsText;
        }
      }

      output.value = formatted;
      document.getElementById("stat-in").textContent = jsText.length;
      document.getElementById("stat-out").textContent = formatted.length;
      document.getElementById("stat-lines").textContent = formatted.split("\n").length;
      document.getElementById("stat-functions").textContent = countFunctions(jsText);

      showToast("JavaScript formatted successfully!", "success");
    } catch (e) {
      showToast("Error formatting JavaScript: " + e.message, "error");
    }
  });

  document.getElementById("btn-copy").addEventListener("click", () => {
    if (!output.value) {
      showToast("Format JavaScript first.", "warning");
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showToast("Copied to clipboard!", "success");
    });
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    ["stat-in", "stat-out", "stat-lines", "stat-functions"].forEach(id => {
      document.getElementById(id).textContent = "0";
    });
    showToast("Cleared", "success");
  });

  input.addEventListener("input", () => {
    document.getElementById("stat-in").textContent = input.value.length;
  });
});
