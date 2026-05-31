document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("input");
  const output = document.getElementById("output");

  function getIndent() {
    const v = document.getElementById("indent").value;
    if (v === "tab") return "\t";
    return parseInt(v);
  }

  function countXMLNodes(xmlDoc) {
    return xmlDoc.getElementsByTagName("*").length;
  }

  function convertXMLToJSON(xmlText, includeAttributes) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const parsererror = xmlDoc.getElementsByTagName("parsererror");
    if (parsererror.length > 0) {
      throw new Error(parsererror[0].textContent || "XML parsing error");
    }

    function parseNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue.trim();
      }

      const obj = {};

      // Handle attributes
      if (includeAttributes && node.attributes && node.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          obj["@attributes"][attr.name] = attr.value;
        }
      }

      let hasChildren = false;
      let textContent = "";

      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          hasChildren = true;
          const name = child.nodeName;
          const value = parseNode(child);

          if (obj[name] === undefined) {
            obj[name] = value;
          } else {
            if (!Array.isArray(obj[name])) {
              obj[name] = [obj[name]];
            }
            obj[name].push(value);
          }
        } else if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
          const val = child.nodeValue.trim();
          if (val) {
            textContent += val;
          }
        }
      }

      if (!hasChildren) {
        if (includeAttributes && obj["@attributes"]) {
          if (textContent) {
            obj["#text"] = textContent;
          }
          return obj;
        } else {
          return textContent;
        }
      } else {
        if (textContent && includeAttributes && obj["@attributes"]) {
          obj["#text"] = textContent;
        }
      }

      return obj;
    }

    const root = xmlDoc.documentElement;
    if (!root) {
      throw new Error("No root element found in XML");
    }

    const result = {};
    result[root.nodeName] = parseNode(root);
    return {
      json: result,
      nodeCount: countXMLNodes(xmlDoc)
    };
  }

  document.getElementById("btn-convert").addEventListener("click", () => {
    const xmlText = input.value.trim();
    if (!xmlText) {
      showToast("Please paste XML content first.", "warning");
      return;
    }

    try {
      const includeAttributes = document.getElementById("opt-attributes").checked;
      const { json, nodeCount } = convertXMLToJSON(xmlText, includeAttributes);
      const indentVal = getIndent();
      const formattedJSON = JSON.stringify(json, null, indentVal);

      output.value = formattedJSON;
      document.getElementById("stat-in").textContent = xmlText.length;
      document.getElementById("stat-out").textContent = formattedJSON.length;
      document.getElementById("stat-nodes").textContent = nodeCount;
      document.getElementById("stat-lines").textContent = formattedJSON.split("\n").length;

      showToast("XML successfully converted to JSON!", "success");
    } catch (e) {
      showToast("XML Parsing Error: " + e.message, "error");
    }
  });

  document.getElementById("btn-copy").addEventListener("click", () => {
    if (!output.value) {
      showToast("Convert XML first.", "warning");
      return;
    }
    navigator.clipboard.writeText(output.value).then(() => {
      showToast("JSON copied to clipboard!", "success");
    });
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    input.value = "";
    output.value = "";
    ["stat-in", "stat-out", "stat-nodes", "stat-lines"].forEach(id => {
      document.getElementById(id).textContent = "0";
    });
    showToast("Cleared", "success");
  });

  input.addEventListener("input", () => {
    document.getElementById("stat-in").textContent = input.value.length;
  });
});
