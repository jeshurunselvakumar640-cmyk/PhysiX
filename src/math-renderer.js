import katex from "katex";
import autoRender from "katex/dist/contrib/auto-render.mjs";
import "katex/dist/katex.min.css";

const GREEK_ENTITY_MAP = {
  "&alpha;": "\\alpha",
  "&beta;": "\\beta",
  "&gamma;": "\\gamma",
  "&delta;": "\\delta",
  "&epsilon;": "\\epsilon",
  "&zeta;": "\\zeta",
  "&eta;": "\\eta",
  "&theta;": "\\theta",
  "&iota;": "\\iota",
  "&kappa;": "\\kappa",
  "&lambda;": "\\lambda",
  "&mu;": "\\mu",
  "&nu;": "\\nu",
  "&xi;": "\\xi",
  "&pi;": "\\pi",
  "&rho;": "\\rho",
  "&sigma;": "\\sigma",
  "&tau;": "\\tau",
  "&upsilon;": "\\upsilon",
  "&phi;": "\\phi",
  "&chi;": "\\chi",
  "&psi;": "\\psi",
  "&omega;": "\\omega",
  "&Delta;": "\\Delta",
  "&Gamma;": "\\Gamma",
  "&Theta;": "\\Theta",
  "&Lambda;": "\\Lambda",
  "&Sigma;": "\\Sigma",
  "&Phi;": "\\Phi",
  "&Psi;": "\\Psi",
  "&Omega;": "\\Omega",
  "&middot;": "\\cdot",
  "&times;": "\\times",
  "&approx;": "\\approx",
  "&le;": "\\le",
  "&ge;": "\\ge",
  "&ne;": "\\ne",
  "&plusmn;": "\\pm",
  "&infin;": "\\infty",
  "&sup2;": "^2",
  "&sup3;": "^3",
  "&deg;": "^\\circ"
};

const LATEX_KEYWORDS = [
  "frac", "sqrt", "sin", "cos", "tan", "arcsin", "arccos", "arctan",
  "theta", "lambda", "alpha", "beta", "gamma", "Delta", "delta", "phi", "mu", "eta", "rho", "sigma", "omega", "tau",
  "implies", "times", "cdot", "approx", "le", "ge", "pm", "partial", "sum", "int", "vec", "text", "left", "right",
  "lfloor", "rfloor", "lceil", "rceil", "langle", "rangle",
  "log", "ln", "circ", "to", "infty", "hbar", "quad", "qquad", "equiv", "propto", "max", "min", "exp"
];

const UNICODE_SUBSCRIPTS = {
  "₀": "_0", "₁": "_1", "₂": "_2", "₃": "_3", "₄": "_4",
  "₅": "_5", "₆": "_6", "₇": "_7", "₈": "_8", "₉": "_9"
};

const UNICODE_GREEK = {
  "α": "\\alpha", "β": "\\beta", "γ": "\\gamma", "δ": "\\delta", "ε": "\\epsilon",
  "θ": "\\theta", "λ": "\\lambda", "μ": "\\mu", "π": "\\pi", "ρ": "\\rho",
  "σ": "\\sigma", "τ": "\\tau", "φ": "\\phi", "ω": "\\omega",
  "Δ": "\\Delta", "Ω": "\\Omega"
};

const KATEX_OPTIONS = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false }
  ],
  throwOnError: false,
  errorColor: "#ef4444",
  strict: false,
  trust: true,
  ignoredTags: ["script", "noscript", "style", "textarea", "pre"]
};

/**
 * Normalizes a raw mathematical string by resolving HTML entities,
 * fixing escaped backslashes, converting unicode math symbols, and
 * standardizing subscripts/superscripts for KaTeX parsing.
 *
 * @param {string} rawStr - Raw formula string
 * @returns {string} Normalized LaTeX string
 */
export function normalizeLatexFormula(rawStr) {
  if (!rawStr || typeof rawStr !== "string") return "";
  let str = rawStr.trim();

  // Strip wrapping delimiters if present
  if (str.startsWith("$$") && str.endsWith("$$") && str.length >= 4) {
    str = str.slice(2, -2).trim();
  } else if (str.startsWith("$") && str.endsWith("$") && str.length >= 2) {
    str = str.slice(1, -1).trim();
  } else if (str.startsWith("\\[") && str.endsWith("\\]") && str.length >= 4) {
    str = str.slice(2, -2).trim();
  } else if (str.startsWith("\\(") && str.endsWith("\\)") && str.length >= 4) {
    str = str.slice(2, -2).trim();
  }

  // Replace HTML entities
  for (const [entity, replacement] of Object.entries(GREEK_ENTITY_MAP)) {
    if (str.includes(entity)) {
      str = str.split(entity).join(replacement + " ");
    }
  }
  str = str.replace(/&nbsp;/g, "\\quad ")
           .replace(/&lt;/g, "<")
           .replace(/&gt;/g, ">")
           .replace(/&amp;/g, "&");

  // Fix literal ${var}^2 or ${var}_sub from JS template interpolation or typo
  str = str.replace(/\$\{([a-zA-Z0-9_]+)\}/g, "{$1}")
           .replace(/\\\$([a-zA-Z0-9_]+)/g, "$1");

  // Fix accidental double backslashes before LaTeX keywords (e.g. \\frac -> \frac), but preserve \\ line breaks
  LATEX_KEYWORDS.forEach(kw => {
    const re = new RegExp("\\\\\\\\" + kw + "(?![a-zA-Z])", "g");
    str = str.replace(re, "\\" + kw);
  });
  str = str.replace(/\\\\left/g, "\\left")
           .replace(/\\\\right/g, "\\right");

  // Auto-prefix missing backslash on lone LaTeX keywords when preceded by space, $, or start of string
  LATEX_KEYWORDS.forEach(kw => {
    const re = new RegExp("(^|[\\s(=+\\-\\*\\/\\$])(" + kw + ")(?![a-zA-Z])", "g");
    str = str.replace(re, (m, prefix, word) => {
      return prefix + "\\" + word;
    });
  });

  // Multi-character superscripts/subscripts first
  str = str.replace(/⁻³/g, "^{-3}")
           .replace(/⁻²/g, "^{-2}")
           .replace(/⁻¹/g, "^{-1}")
           .replace(/²/g, "^2")
           .replace(/³/g, "^3");

  // Replace Unicode subscripts
  str = str.replace(/[₀-₉]/g, char => UNICODE_SUBSCRIPTS[char] || char);

  // Replace Unicode Greek letters
  str = str.replace(/[αβγδεθλμπρστφωΔΩ]/g, char => ` ${UNICODE_GREEK[char] || char} `);

  // Unicode math symbols to standard LaTeX
  str = str.replace(/×/g, " \\times ")
           .replace(/·/g, " \\cdot ")
           .replace(/⟹/g, " \\implies ")
           .replace(/≈/g, " \\approx ")
           .replace(/≤/g, " \\le ")
           .replace(/≥/g, " \\ge ")
           .replace(/±/g, " \\pm ")
           .replace(/∑/g, " \\sum ")
           .replace(/∫/g, " \\int ")
           .replace(/∝/g, " \\propto ")
           .replace(/√\(([^)]+)\)/g, " \\sqrt{$1} ")
           .replace(/√([a-zA-Z0-9]+)/g, " \\sqrt{$1} ")
           .replace(/°/g, "^\\circ ");

  // Convert HTML <sub> and <sup> tags
  str = str.replace(/<sub>(.*?)<\/sub>/gi, "_{$1}")
           .replace(/<sup>(.*?)<\/sup>/gi, "^{$1}");

  // Fix empty braces {}
  str = str.replace(/\{\s*\}/g, "");

  return str.trim();
}

/**
 * Checks if a string represents an unadorned or delimited mathematical formula.
 * @param {string} str 
 * @returns {boolean}
 */
export function isFormulaText(str) {
  if (!str || typeof str !== "string") return false;
  const s = str.trim();
  if (s.startsWith("$") || s.startsWith("\\(") || s.startsWith("\\[") || s.startsWith("$$")) return true;
  return LATEX_KEYWORDS.some(kw => s.includes("\\" + kw) || s.includes("\\\\" + kw));
}

/**
 * Replaces $$...$$ and $...$ with KaTeX HTML in a raw string.
 * Also renders bare LaTeX formulas directly if no surrounding prose exists.
 * Preserves URLs, normal slashes, and ordinary text.
 *
 * @param {string} str - Raw string
 * @returns {string} String with rendered KaTeX HTML
 */
export function renderMathInString(str) {
  if (!str || typeof str !== "string") return str || "";

  // 1. Block math: $$...$$ or \[...\]
  let result = str.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    try {
      const norm = normalizeLatexFormula(expr);
      return `<div class="katex-display formula-latex">${katex.renderToString(norm, { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  result = result.replace(/\\\[([\s\S]+?)\\\]/g, (match, expr) => {
    try {
      const norm = normalizeLatexFormula(expr);
      return `<div class="katex-display formula-latex">${katex.renderToString(norm, { displayMode: true, throwOnError: false })}</div>`;
    } catch (e) {
      return match;
    }
  });

  // 2. Inline math: $...$ or \(...\) (supports multiline equations)
  result = result.replace(/\$([^\$]+?)\$/g, (match, expr) => {
    if (!expr.trim()) return match;
    // Guard against currency (e.g. $50 or $100.00)
    if (/^\d+(\.\d{1,2})?$/.test(expr.trim())) return match;
    try {
      const norm = normalizeLatexFormula(expr);
      return katex.renderToString(norm, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  result = result.replace(/\\\(([\s\S]+?)\\\)/g, (match, expr) => {
    if (!expr.trim()) return match;
    try {
      const norm = normalizeLatexFormula(expr);
      return katex.renderToString(norm, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  // 3. If string was not matched but is a bare LaTeX formula (contains \frac, \sqrt, etc.)
  // and is not plain HTML or a web URL:
  if (result === str && isFormulaText(str) && !str.includes("<") && !str.includes("http") && !str.includes("://")) {
    try {
      const norm = normalizeLatexFormula(str);
      return katex.renderToString(norm, { displayMode: false, throwOnError: false });
    } catch (_) {}
  }

  return result;
}

/**
 * Alias for renderMathInString — renders math in a text string.
 * @param {string} str 
 * @returns {string} String with rendered KaTeX HTML
 */
export function renderMathInText(str) {
  return renderMathInString(str);
}

/**
 * Shared Markdown formatter with KaTeX math rendering.
 * Extracts math into tokens, parses Markdown, and injects KaTeX HTML.
 * @param {string} markdownText 
 * @returns {string} Rendered HTML
 */
export function formatMarkdownWithMath(markdownText) {
  if (!markdownText) return "";

  // Step 1: Extract and render math into placeholders to protect from markdown regexes
  const mathPlaceholders = [];

  // Block math $$...$$ and \[...\]
  let text = markdownText.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    const norm = normalizeLatexFormula(expr);
    const rendered = `<div class="katex-display formula-latex">${katex.renderToString(norm, { displayMode: true, throwOnError: false })}</div>`;
    const idx = mathPlaceholders.push(rendered) - 1;
    return `%%KATEX_MATH_PH_${idx}%%`;
  });

  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (match, expr) => {
    const norm = normalizeLatexFormula(expr);
    const rendered = `<div class="katex-display formula-latex">${katex.renderToString(norm, { displayMode: true, throwOnError: false })}</div>`;
    const idx = mathPlaceholders.push(rendered) - 1;
    return `%%KATEX_MATH_PH_${idx}%%`;
  });

  // Inline math $...$ and \(...\)
  text = text.replace(/\$([^\$]+?)\$/g, (match, expr) => {
    if (!expr.trim()) return match;
    if (/^\d+(\.\d{1,2})?$/.test(expr.trim())) return match;
    const norm = normalizeLatexFormula(expr);
    const rendered = katex.renderToString(norm, { displayMode: false, throwOnError: false });
    const idx = mathPlaceholders.push(rendered) - 1;
    return `%%KATEX_MATH_PH_${idx}%%`;
  });

  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (match, expr) => {
    if (!expr.trim()) return match;
    const norm = normalizeLatexFormula(expr);
    const rendered = katex.renderToString(norm, { displayMode: false, throwOnError: false });
    const idx = mathPlaceholders.push(rendered) - 1;
    return `%%KATEX_MATH_PH_${idx}%%`;
  });

  // Step 2: Format standard Markdown elements
  text = text
    .replace(/^#### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code class="font-mono">$1</code>');

  const lines = text.split("\n");
  const formattedLines = [];
  let inList = false;
  let inTable = false;

  for (let line of lines) {
    const trimmed = line.trim();

    // Horizontal Rule
    if (trimmed === "***" || trimmed === "---" || trimmed === "___") {
      if (inList) { formattedLines.push("</ul>"); inList = false; }
      if (inTable) { formattedLines.push("</tbody></table>"); inTable = false; }
      formattedLines.push("<hr />");
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      if (inList) { formattedLines.push("</ul>"); inList = false; }
      if (inTable) { formattedLines.push("</tbody></table>"); inTable = false; }
      formattedLines.push(`<blockquote>${trimmed.substring(2)}</blockquote>`);
      continue;
    }

    // Markdown Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (inList) { formattedLines.push("</ul>"); inList = false; }
      const cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
      // Check if separator row
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        continue;
      }
      if (!inTable) {
        formattedLines.push("<table><thead><tr>");
        cells.forEach(c => formattedLines.push(`<th>${c}</th>`));
        formattedLines.push("</tr></thead><tbody>");
        inTable = true;
      } else {
        formattedLines.push("<tr>");
        cells.forEach(c => formattedLines.push(`<td>${c}</td>`));
        formattedLines.push("</tr>");
      }
      continue;
    } else if (inTable) {
      formattedLines.push("</tbody></table>");
      inTable = false;
    }

    // List item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        formattedLines.push("<ul>");
        inList = true;
      }
      formattedLines.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        formattedLines.push("</ul>");
        inList = false;
      }
      if (trimmed.length > 0) {
        if (!trimmed.startsWith("<h") && !trimmed.startsWith("<div") && !trimmed.startsWith("<blockquote") && !trimmed.startsWith("<table") && !trimmed.startsWith("<hr")) {
          formattedLines.push(`<p>${trimmed}</p>`);
        } else {
          formattedLines.push(trimmed);
        }
      }
    }
  }
  if (inList) formattedLines.push("</ul>");
  if (inTable) formattedLines.push("</tbody></table>");

  let html = formattedLines.join("");

  // Step 3: Restore rendered KaTeX math placeholders
  html = html.replace(/%%KATEX_MATH_PH_(\d+)%%/g, (match, idx) => {
    return mathPlaceholders[Number(idx)] || match;
  });

  return html;
}

/**
 * Comprehensive DOM formula renderer.
 * 1. Finds and directly renders dedicated formula containers (.f-eq, .math-callout, .formula-latex,
 *    .formula-item code, etc.) using display/inline KaTeX.
 * 2. Scans general <code> elements containing unrendered LaTeX math formulas.
 * 3. Runs KaTeX auto-render on all text nodes with delimiters ($...$, $$...$$, etc.).
 *
 * @param {HTMLElement} root - DOM element to render math inside (defaults to document.body)
 */
export function renderMathInDOM(root = document.body) {
  if (!root || typeof root.querySelectorAll !== "function") return;

  try {
    // 1. Process dedicated formula elements and containers
    const dedicatedSelectors = [
      ".f-eq",
      ".math-callout",
      ".formula-latex",
      ".f-formula",
      ".math-display",
      ".formula-item code",
      ".formula-card code",
      ".manual-formula-card .f-eq",
      ".of-formula-recap code",
      ".formula-recap code",
      ".formula-block code",
      "[data-formula]"
    ];

    const dedicatedEls = root.querySelectorAll(dedicatedSelectors.join(","));
    dedicatedEls.forEach(el => {
      // If already rendered with KaTeX, skip
      if (el.querySelector(".katex") || el.hasAttribute("data-math-rendered")) return;

      const raw = el.textContent || el.innerText || "";
      if (!raw.trim()) return;

      // If container contains prose mixed with inline $ delimiters, render with renderMathInString
      if (raw.includes("$") && !((raw.startsWith("$") && raw.endsWith("$")) || (raw.startsWith("$$") && raw.endsWith("$$")))) {
        el.innerHTML = renderMathInString(raw);
        el.setAttribute("data-math-rendered", "true");
        return;
      }

      const isBlock = el.classList.contains("f-eq") ||
                      el.classList.contains("math-callout") ||
                      el.classList.contains("math-display") ||
                      el.classList.contains("formula-latex") ||
                      el.classList.contains("f-formula");

      const norm = normalizeLatexFormula(raw);
      try {
        const renderedHtml = katex.renderToString(norm, {
          displayMode: isBlock,
          throwOnError: false,
          errorColor: "#ef4444"
        });
        el.innerHTML = renderedHtml;
        el.setAttribute("data-math-rendered", "true");
        el.classList.add("katex-rendered-block");
      } catch (err) {
        console.warn("[MathRenderer] Dedicated container render error:", err);
      }
    });

    // 2. Scan all unrendered <code> tags in root that contain LaTeX formula keywords
    const codeEls = root.querySelectorAll("code:not([data-math-rendered])");
    codeEls.forEach(codeEl => {
      if (codeEl.querySelector(".katex") || codeEl.hasAttribute("data-math-rendered")) return;
      const text = (codeEl.textContent || "").trim();
      if (!text) return;
      if (isFormulaText(text) || text.includes("\\frac") || text.includes("\\sqrt") || text.includes("\\sin") || text.includes("\\cos") || text.includes("\\tan") || text.includes("\\theta") || text.includes("\\lambda") || text.includes("\\alpha") || text.includes("\\Delta") || text.includes("\\Omega") || text.includes("\\times") || text.includes("\\cdot") || text.includes("\\approx") || text.includes("\\sum") || text.includes("\\int") || text.includes("\\implies") || text.includes("\\pm")) {
        const norm = normalizeLatexFormula(text);
        try {
          codeEl.innerHTML = katex.renderToString(norm, {
            displayMode: false,
            throwOnError: false,
            errorColor: "#ef4444"
          });
          codeEl.setAttribute("data-math-rendered", "true");
          codeEl.classList.add("katex-rendered-code");
        } catch (e) {}
      }
    });

    // 3. Standard auto-render for all general text containing delimiters ($...$, $$...$$, etc.)
    autoRender(root, KATEX_OPTIONS);

    // 4. Mark processed root
    if (root.setAttribute) {
      root.setAttribute("data-math-rendered", "true");
    }
  } catch (err) {
    console.warn("[MathRenderer] renderMathInDOM error:", err);
  }
}

/**
 * Alias for renderMathInDOM — renders math inside a DOM element.
 * @param {HTMLElement} root - DOM element to render math inside
 */
export function renderMathInElement(root) {
  return renderMathInDOM(root);
}

let isObserverInstalled = false;

/**
 * Automatically initializes math rendering across document.body once DOM is ready.
 * Installs a debounced MutationObserver so newly inserted elements (challenges,
 * observation tables, modals, inspector cards) are automatically rendered.
 */
export function initMathRenderer() {
  const doRender = () => {
    if (typeof document !== "undefined" && document.body) {
      renderMathInDOM(document.body);

      // Install lightweight MutationObserver to catch dynamic DOM injections
      if (!isObserverInstalled && typeof MutationObserver !== "undefined") {
        isObserverInstalled = true;
        let debounceTimer = null;

        const observer = new MutationObserver((mutations) => {
          let shouldRender = false;
          for (const mut of mutations) {
            if (mut.type === "childList" && mut.addedNodes.length > 0) {
              for (const node of mut.addedNodes) {
                if (node.nodeType === 1) { // ELEMENT_NODE
                  // Skip KaTeX internal nodes and script/style
                  if (node.classList?.contains("katex") ||
                      node.classList?.contains("katex-html") ||
                      node.classList?.contains("katex-mathml") ||
                      node.tagName === "SCRIPT" ||
                      node.tagName === "STYLE") {
                    continue;
                  }
                  shouldRender = true;
                  break;
                }
              }
            }
            if (shouldRender) break;
          }

          if (shouldRender) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              renderMathInDOM(document.body);
            }, 80);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", doRender);
    } else {
      doRender();
    }

    // Expose helpers globally for seamless cross-component access
    window.renderMathInDOM = renderMathInDOM;
    window.renderMathInElement = renderMathInElement;
    window.renderMathInText = renderMathInText;
    window.renderMathInString = renderMathInString;
  }
}
