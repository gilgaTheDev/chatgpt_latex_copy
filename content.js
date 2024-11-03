function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error("Failed to copy text to clipboard:", err);
  });
}

function processExpressions() {
  const domain = window.location.hostname;
  let selectors = [];

  // Determine selectors based on the domain
  if (domain === "poe.com") {
    // For poe.com, handle both MathJax and KaTeX expressions
    selectors = [".MathJax", ".katex"];
  } else {
    // For other domains, handle only KaTeX expressions
    selectors = [".katex"];
  }

  // Process each selector
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((expression) => {
      if (expression._processed) return; // Skip already processed expressions
      expression._processed = true;

      // Get the LaTeX content from the expression
      let tex = getTexContent(expression, domain);
      if (!tex) return; // Skip if no LaTeX code is found

      // Set up event listeners for interaction
      setupEventListeners(expression, tex);
    });
  });
}

// Function to extract LaTeX content based on domain and expression type
function getTexContent(expression, domain) {
  if (domain === "poe.com" && expression.matches(".MathJax")) {
    // For MathJax on poe.com, get content from the next sibling script element
    const scriptElement = expression.nextElementSibling;
    if (scriptElement && scriptElement.tagName.toLowerCase() === "script") {
      return scriptElement.innerHTML;
    }
  } else {
    // For KaTeX or other expressions, get content from a child element
    const texElement = expression.querySelector('[encoding="application/x-tex"]');
    if (texElement) {
      return texElement.innerHTML;
    }
  }
  return null; // Return null if no content is found
}

// Function to set up event listeners for copying and tooltip display
function setupEventListeners(expression, tex) {
  // Copy LaTeX to clipboard on click
  expression.addEventListener("click", function () {
    copyToClipboard(tex);
  });

  // Show tooltip with LaTeX content on mouseover
  expression.addEventListener("mouseover", function () {
    const tooltip = createTooltip(tex);
    document.body.appendChild(tooltip);

    // Position the tooltip above the expression
    const rect = expression.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    tooltip.style.left = `${rect.left}px`;
    expression._tooltip = tooltip;
  });

  // Remove tooltip on mouseout
  expression.addEventListener("mouseout", function () {
    if (expression._tooltip) {
      document.body.removeChild(expression._tooltip);
      expression._tooltip = null;
    }
  });

  // Change cursor to indicate copy action
  expression.style.cssText = "cursor:copy;";
}

// Function to create a styled tooltip element
function createTooltip(tex) {
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
  return tooltip;
}

// Observe DOM changes to process new expressions dynamically
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes) {
      processExpressions();
    }
  });
});

// Start observing the document body for added nodes
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initial processing of expressions on page load
processExpressions();
