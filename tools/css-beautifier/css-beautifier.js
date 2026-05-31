document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");

  function getIndent() {
    const v = document.getElementById("indent").value;
    if (v === "tab") return "\t";
    return " ".repeat(parseInt(v));
  }

  function countCSSRules(css) {
    // Count opening curly braces outside of comments
    const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
    return (cleaned.match(/\{/g) || []).length;
  }

  function minifyCSS(css, preserveComments) {
    let result = css;
    if (!preserveComments) {
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    }
    return result
      .replace(/\s+/g, " ")
      .replace(/\s*([{};,])\s*/g, "$1")
      .replace(/;}/g, "}")
      .trim();
  }

  document.getElementById("btn-format").addEventListener("click", () => {
    const cssText = input.value.trim();
    if (!cssText) {
      showToast("Please paste some CSS first.", "warning");
      return;
    }

    try {
      let formatted = "";
      const isMinify = document.getElementById("opt-minify").checked;
      const preserveComments = document.getElementById("opt-preserve-comments").checked;

      if (isMinify) {
        formatted = minifyCSS(cssText, preserveComments);
      } else {
        const indentVal = getIndent();
        const options = {
          indent_size: indentVal === "\t" ? 1 : indentVal.length,
          indent_char: indentVal === "\t" ? "\t" : " ",
          selector_separator_newline: true,
          newline_between_rules: true,
          preserve_newlines: true
        };

        if (window.css_beautify) {
          formatted = window.css_beautify(cssText, options);
          if (!preserveComments) {
            formatted = formatted.replace(/\/\*[\s\S]*?\*\//g, "").trim();
          }
        } else {
          // Fallback simple formatter in case CDN fails
          formatted = cssText;
        }
      }

      output.value = formatted;
      document.getElementById("stat-in").textContent = cssText.length;
      document.getElementById("stat-out").textContent = formatted.length;
      document.getElementById("stat-lines").textContent = formatted.split("\n").length;
      document.getElementById("stat-selectors").textContent = countCSSRules(cssText);

      showToast("CSS formatted successfully!", "success");
    } catch (e) {
      showToast("Error formatting CSS: " + e.message, "error");
    }
  });

  document.getElementById("btn-copy").addEventListener("click", () => {
    if (!output.value) {
      showToast("Format CSS first.", "warning");
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showToast("Copied to clipboard!", "success");
    });
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    ["stat-in", "stat-out", "stat-lines", "stat-selectors"].forEach(id => {
      document.getElementById(id).textContent = "0";
    });
    showToast("Cleared", "success");
  });

  input.addEventListener("input", () => {
    document.getElementById("stat-in").textContent = input.value.length;
  });
});
