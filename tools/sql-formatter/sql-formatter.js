document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");

  const SQL_KEYWORDS = new Set([
    "SELECT", "FROM", "WHERE", "JOIN", "ON", "AND", "OR", "GROUP BY", "ORDER BY",
    "HAVING", "LIMIT", "OFFSET", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE",
    "CREATE", "TABLE", "DROP", "ALTER", "LEFT", "RIGHT", "INNER", "OUTER", "CROSS",
    "AS", "IN", "IS", "NOT", "NULL", "UNION", "ALL", "BY", "ASC", "DESC", "DISTINCT"
  ]);

  const MAJOR_CLAUSES = new Set([
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", 
    "OUTER JOIN", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "SET", "VALUES"
  ]);

  const NEWLINE_KEYWORDS = new Set([
    "AND", "OR", "ON", "UNION"
  ]);

  function getIndent() {
    const v = document.getElementById("indent").value;
    if (v === "tab") return "\t";
    return " ".repeat(parseInt(v));
  }

  function countQueries(sql) {
    // Count semicolons outside strings and comments
    const cleaned = sql.replace(/\/\*[\s\S]*?\*\/|--.*$/gm, "").replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
    const matches = cleaned.match(/;/g);
    return matches ? matches.length + (cleaned.trim().endsWith(";") ? 0 : 1) : 1;
  }

  function tokenize(sql) {
    const tokens = [];
    let i = 0;
    const len = sql.length;

    while (i < len) {
      const char = sql[i];

      // White spaces
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Single line comments
      if (char === "-" && sql[i + 1] === "-") {
        let start = i;
        while (i < len && sql[i] !== "\n" && sql[i] !== "\r") i++;
        tokens.push({ type: "comment", val: sql.slice(start, i) });
        continue;
      }

      // Block comments
      if (char === "/" && sql[i + 1] === "*") {
        let start = i;
        i += 2;
        while (i < len && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
        i += 2;
        tokens.push({ type: "comment", val: sql.slice(start, i) });
        continue;
      }

      // String literals
      if (char === "'" || char === '"' || char === "`") {
        const quote = char;
        let start = i;
        i++;
        while (i < len) {
          if (sql[i] === "\\" && i + 1 < len) {
            i += 2;
          } else if (sql[i] === quote) {
            i++;
            break;
          } else {
            i++;
          }
        }
        tokens.push({ type: "string", val: sql.slice(start, i) });
        continue;
      }

      // Words & identifiers
      if (/[a-zA-Z_0-9#]/.test(char)) {
        let start = i;
        while (i < len && /[a-zA-Z_0-9#.]/.test(sql[i])) i++;
        tokens.push({ type: "word", val: sql.slice(start, i) });
        continue;
      }

      // Brackets and other punctuation symbols
      tokens.push({ type: "symbol", val: char });
      i++;
    }

    // Merge multi-word keywords (e.g. LEFT JOIN, GROUP BY, ORDER BY, INSERT INTO, DELETE FROM)
    const merged = [];
    for (let t = 0; t < tokens.length; t++) {
      const curr = tokens[t];
      const next = tokens[t + 1];
      const nextNext = tokens[t + 2];

      if (curr.type === "word" && next && next.type === "word") {
        const twoWords = (curr.val + " " + next.val).toUpperCase();
        if (MAJOR_CLAUSES.has(twoWords) || twoWords === "INSERT INTO" || twoWords === "DELETE FROM") {
          merged.push({ type: "word", val: curr.val + " " + next.val });
          t++;
          continue;
        }
      }
      merged.push(curr);
    }

    return merged;
  }

  function formatSQL(sql, keywordCase, indentStr) {
    const tokens = tokenize(sql);
    let result = "";
    let indentLevel = 0;
    let newlinePending = false;

    function applyIndent() {
      return indentStr.repeat(indentLevel);
    }

    for (let t = 0; t < tokens.length; t++) {
      const token = tokens[t];
      const valUpper = token.val.toUpperCase();

      if (token.type === "comment") {
        if (result.length > 0 && !result.endsWith("\n")) {
          result += "\n";
        }
        result += applyIndent() + token.val + "\n";
        newlinePending = true;
        continue;
      }

      if (token.type === "string") {
        if (newlinePending) {
          result += applyIndent();
          newlinePending = false;
        }
        result += token.val + " ";
        continue;
      }

      if (token.type === "symbol") {
        if (token.val === "(") {
          result = result.trimEnd() + " (";
          indentLevel++;
          result += "\n" + applyIndent();
          newlinePending = false;
        } else if (token.val === ")") {
          indentLevel = Math.max(0, indentLevel - 1);
          result = result.trimEnd() + "\n" + applyIndent() + ")";
          result += " ";
          newlinePending = false;
        } else if (token.val === ",") {
          result = result.trimEnd() + ", ";
          // Add a newline after commas if we're inside lists/select columns
          // but simplify for this basic formatter by keeping inline unless it's very long
        } else if (token.val === ";") {
          result = result.trimEnd() + ";\n\n";
          indentLevel = 0;
          newlinePending = true;
        } else {
          result = result.trimEnd() + token.val + " ";
        }
        continue;
      }

      if (token.type === "word") {
        let finalVal = token.val;
        const isKeyword = SQL_KEYWORDS.has(valUpper) || MAJOR_CLAUSES.has(valUpper);

        if (isKeyword) {
          if (keywordCase === "upper") {
            finalVal = valUpper;
          } else if (keywordCase === "lower") {
            finalVal = valUpper.toLowerCase();
          }
        }

        // Newline rules for keywords
        if (MAJOR_CLAUSES.has(valUpper)) {
          result = result.trimEnd();
          if (result.length > 0 && !result.endsWith("\n")) {
            result += "\n";
          }
          result += applyIndent() + finalVal + " ";
          newlinePending = false;
        } else if (NEWLINE_KEYWORDS.has(valUpper)) {
          result = result.trimEnd() + "\n" + applyIndent() + indentStr + finalVal + " ";
          newlinePending = false;
        } else {
          if (newlinePending) {
            result += applyIndent();
            newlinePending = false;
          }
          result += finalVal + " ";
        }
      }
    }

    return result.trim();
  }

  document.getElementById("btn-format").addEventListener("click", () => {
    const sqlText = input.value.trim();
    if (!sqlText) {
      showToast("Please enter SQL query first.", "warning");
      return;
    }

    try {
      const keywordCase = document.getElementById("keyword-case").value;
      const indentStr = getIndent();

      const formatted = formatSQL(sqlText, keywordCase, indentStr);
      output.value = formatted;

      document.getElementById("stat-in").textContent = sqlText.length;
      document.getElementById("stat-out").textContent = formatted.length;
      document.getElementById("stat-lines").textContent = formatted ? formatted.split("\n").length : 0;
      document.getElementById("stat-queries").textContent = countQueries(sqlText);

      showToast("SQL formatted successfully!", "success");
    } catch (e) {
      showToast("Formatting Error: " + e.message, "error");
    }
  });

  document.getElementById("btn-copy").addEventListener("click", () => {
    if (!output.value) {
      showToast("Format SQL query first.", "warning");
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showToast("Copied to clipboard!", "success");
    });
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    ["stat-in", "stat-out", "stat-lines", "stat-queries"].forEach(id => {
      document.getElementById(id).textContent = "0";
    });
    showToast("Cleared", "success");
  });

  input.addEventListener("input", () => {
    document.getElementById("stat-in").textContent = input.value.length;
  });
});
