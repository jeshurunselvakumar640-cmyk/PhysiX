import katex from "katex";

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

function normalizeLatexFormula(rawStr) {
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

  // Fix literal ${var}^2 or ${var}_2
  str = str.replace(/\$\{([a-zA-Z0-9_]+)\}/g, "{$1}")
           .replace(/\\\$([a-zA-Z0-9_]+)/g, "$1");

  // Fix double backslashes before LaTeX keywords (e.g. \\frac -> \frac), but preserve \\ line breaks
  LATEX_KEYWORDS.forEach(kw => {
    const re = new RegExp("\\\\\\\\" + kw + "(?![a-zA-Z])", "g");
    str = str.replace(re, "\\" + kw);
  });
  str = str.replace(/\\\\left/g, "\\left")
           .replace(/\\\\right/g, "\\right");

  // Auto-prefix missing backslash on lone LaTeX keywords when preceded by space or start of string
  LATEX_KEYWORDS.forEach(kw => {
    // keyword at start or after space/paren/operator, not already preceded by backslash
    const re = new RegExp("(^|[\\s(=+\\-\\*\\/])(" + kw + ")(?![a-zA-Z])", "g");
    str = str.replace(re, (m, prefix, word) => {
      return prefix + "\\" + word;
    });
  });

  return str.trim();
}

console.log("Test 1: normalize 'T = \\\\frac{a}{b}' ->", normalizeLatexFormula("T = \\\\frac{a}{b}"));
console.log("Test 2: normalize '${v_0}^2' ->", normalizeLatexFormula("${v_0}^2"));
console.log("Test 3: normalize '$approx 0.7' ->", normalizeLatexFormula("$approx 0.7"));
console.log("KaTeX render on Test 2:", katex.renderToString(normalizeLatexFormula("${v_0}^2"), { throwOnError: false }));
