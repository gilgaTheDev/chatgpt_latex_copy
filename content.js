function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Failed to copy text to clipboard:", err);
  });
}

// Define a function to get the appropriate selector based on the website domain
function getSelectorForWebsite() {
  const domain = window.location.hostname;

  // Define selectors for different domains
  const selectors = {
    "chatgpt.com": ".katex", // Original website
    "poe.com": ".MathJax", // Another website
    // Add more domains and their selectors as needed
  };

  // Return the selector for the current domain, or a default if not found
  return selectors[domain] || ".defaultSelector";
}

function processExpressions() {
  // Use the selector based on the current domain
  const selector = getSelectorForWebsite();
  const expressions = document.querySelectorAll(selector);
  expressions.forEach((expression) => {
    if (expression._processed) return;
    expression._processed = true;

    let tex;
    if (selector === ".MathJax") {
      // For MathJax elements, find the next sibling script element
      const scriptElement = expression.nextElementSibling;
      if (scriptElement && scriptElement.tagName.toLowerCase() === "script") {
        tex = scriptElement.innerHTML;
      }
    } else {
      // Default case for other selectors
      const texElement = expression.querySelector('[encoding="application/x-tex"]');
      if (texElement) {
        tex = texElement.innerHTML;
      }
    }

    if (!tex) return; // Skip if no LaTeX code is found

    expression.addEventListener("click", function () {
      copyToClipboard(tex);
    });

    expression.addEventListener("mouseover", function () {
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.innerHTML = tex;
      tooltip.style.cssText = `
              position: absolute;
              background-color: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(7px);
              border: 1px solid #7b7b7b;
              padding: 4px 6px;
              z-index: 10;
              white-space: nowrap;
              border-radius: 5px;
              font-size: 13px;
              color: #d5d5d5;
          `;
      document.body.appendChild(tooltip);

      const rect = expression.getBoundingClientRect();
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
      tooltip.style.left = `${rect.left}px`;
      expression._tooltip = tooltip;
    });

    expression.addEventListener("mouseout", function () {
      if (expression._tooltip) {
        document.body.removeChild(expression._tooltip);
        expression._tooltip = null;
      }
    });

    expression.style.cssText = "cursor:copy;";
  });
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes) {
      processExpressions();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

processExpressions();
