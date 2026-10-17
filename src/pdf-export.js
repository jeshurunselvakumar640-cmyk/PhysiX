/**
 * PhysiX • Universal Scientific Laboratory Report & Telemetry PDF Engine
 * Generates modern, distinctive, publication-grade virtual physics laboratory reports.
 * Compliant with academic submission standards: clean typography, elegant palette
 * (midnight navy #0f172a, electric blue/sky #0284c7, soft slate #f8fafc),
 * vector quantum atom branding, structured telemetry tables, formula panels,
 * embedded live apparatus graphs, and verified educational references.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EXPERIMENT_DETAILS } from "./experiment-details-data.js";

/**
 * Draw a smoothly rotated vector ellipse in jsPDF using trigonometric parametric segments
 */
function drawRotatedEllipse(doc, cx, cy, rx, ry, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const steps = 36;
  let prevX = cx + rx * cosA;
  let prevY = cy + rx * sinA;

  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const px = rx * Math.cos(t);
    const py = ry * Math.sin(t);
    const currX = cx + (px * cosA - py * sinA);
    const currY = cy + (px * sinA + py * cosA);
    doc.line(prevX, prevY, currX, currY);
    prevX = currX;
    prevY = currY;
  }
}

/**
 * Draw vector PhysiX Quantum Atom Logo in jsPDF
 */
export function drawVectorPhysixLogo(doc, cx, cy, size = 5) {
  try {
    doc.saveGraphicsState();
  } catch (e) {}

  doc.setLineWidth(0.3);

  // Orbit 1: +30 deg tilt (Cyan)
  doc.setDrawColor(6, 182, 212);
  drawRotatedEllipse(doc, cx, cy, size, size * 0.42, 30);

  // Orbit 2: -30 deg tilt (Indigo / Purple)
  doc.setDrawColor(129, 140, 248);
  drawRotatedEllipse(doc, cx, cy, size, size * 0.42, -30);

  // Orbit 3: 90 deg tilt (Emerald / Teal)
  doc.setDrawColor(52, 211, 153);
  drawRotatedEllipse(doc, cx, cy, size, size * 0.42, 90);

  // Core Nucleus
  doc.setFillColor(56, 189, 248);
  doc.circle(cx, cy, size * 0.28, "F");

  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, size * 0.12, "F");

  try {
    doc.restoreGraphicsState();
  } catch (e) {}
}

/**
 * Converts HTML entities, Greek unicode characters, and markup into clean,
 * publication-grade plain text suitable for standard PDF font rendering.
 * Prevents corrupted entity strings such as &a&b&c&d&e, &amp;, or unescaped tokens.
 *
 * @param {string} text - Raw string or HTML snippet
 * @returns {string} Sanitized plain text
 */
export function cleanTextForPdf(text) {
  if (!text || typeof text !== "string") return "";

  let s = text;

  // 0. Decode numerical entities (e.g., &#176; -> °, &#x03BC; -> μ)
  s = s.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  // 1. Resolve full named HTML entities first
  const ENTITY_MAP = {
    "&alpha;": "alpha",
    "&beta;": "beta",
    "&gamma;": "gamma",
    "&delta;": "delta",
    "&epsilon;": "epsilon",
    "&eta;": "eta",
    "&theta;": "theta",
    "&lambda;": "lambda",
    "&mu;": "u",
    "&pi;": "pi",
    "&rho;": "rho",
    "&sigma;": "sigma",
    "&tau;": "tau",
    "&phi;": "phi",
    "&omega;": "omega",
    "&Delta;": "Delta",
    "&Omega;": "Ohm",
    "&middot;": "*",
    "&times;": "x",
    "&approx;": "~=",
    "&le;": "<=",
    "&ge;": ">=",
    "&ne;": "!=",
    "&plusmn;": "+/-",
    "&infin;": "infinity",
    "&deg;": " deg",
    "&nbsp;": " ",
    "&quot;": '"',
    "&#39;": "'",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&"
  };

  for (const [ent, rep] of Object.entries(ENTITY_MAP)) {
    s = s.split(ent).join(rep);
  }

  // 2. Eliminate any malformed chained entities like &a&b&c&d&e
  s = s.replace(/(&[a-zA-Z0-9]+){2,}/g, "");
  // Remove remaining unknown entity tags like &xyz;
  s = s.replace(/&[a-zA-Z0-9#]+;/g, " ");

  // 3. Convert Unicode Greek & Scientific characters to ASCII-safe PDF equivalents
  const UNICODE_MAP = {
    "μ": "u",
    "µ": "u",
    "Ω": "Ohm",
    "Δ": "Delta",
    "λ": "lambda",
    "θ": "theta",
    "α": "alpha",
    "β": "beta",
    "γ": "gamma",
    "π": "pi",
    "σ": "sigma",
    "ω": "omega",
    "±": "+/-",
    "×": "x",
    "·": "*",
    "≈": "~=",
    "≤": "<=",
    "≥": ">=",
    "≠": "!=",
    "°": " deg",
    "⟹": " => ",
    "→": " -> ",
    "−": "-",
    "–": "-",
    "—": " - ",
    "“": '"',
    "”": '"',
    "‘": "'",
    "’": "'",
    "₀": "_0", "₁": "_1", "₂": "_2", "₃": "_3", "₄": "_4",
    "₅": "_5", "₆": "_6", "₇": "_7", "₈": "_8", "₉": "_9",
    "²": "^2", "³": "^3", "⁻¹": "^-1", "⁻²": "^-2", "⁻³": "^-3"
  };

  for (const [uChar, rep] of Object.entries(UNICODE_MAP)) {
    s = s.split(uChar).join(rep);
  }

  // 4. Remove HTML tags, preserving block spacing
  s = s.replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");

  // 5. Clean LaTeX mathematical expressions for readable plain-text report presentation
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)");
  s = s.replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)");
  s = s.replace(/\\sqrt\(([^)]+)\)/g, "sqrt($1)");
  s = s.replace(/\\log_\{10\}\(([^)]+)\)/g, "log10($1)");
  s = s.replace(/\\log_\{10\}/g, "log10");
  s = s.replace(/\\sin\^2/g, "sin^2");
  s = s.replace(/\\cos\^2/g, "cos^2");
  s = s.replace(/\\sin/g, "sin");
  s = s.replace(/\\cos/g, "cos");
  s = s.replace(/\\tan/g, "tan");
  s = s.replace(/\\arcsin/g, "arcsin");
  s = s.replace(/\\times/g, "x");
  s = s.replace(/\\cdot/g, "*");
  s = s.replace(/\\approx/g, "~=");
  s = s.replace(/\\pm/g, "+/-");
  s = s.replace(/\\le/g, "<=");
  s = s.replace(/\\ge/g, ">=");
  s = s.replace(/\\ne/g, "!=");
  s = s.replace(/\\implies/g, "=>");
  s = s.replace(/\\text\{([^}]+)\}/g, "$1");
  s = s.replace(/\\left\(/g, "(");
  s = s.replace(/\\right\)/g, ")");
  s = s.replace(/\\left\[/g, "[");
  s = s.replace(/\\right\]/g, "]");
  s = s.replace(/\\left/g, "");
  s = s.replace(/\\right/g, "");
  s = s.replace(/\\quad/g, "  ");
  s = s.replace(/\\qquad/g, "    ");
  s = s.replace(/\\circ/g, "deg");

  // Remove dollar delimiters and braces around single tokens
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, "$1");
  s = s.replace(/\$([^\$]+?)\$/g, "$1");
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, "$1");
  s = s.replace(/\\\(([\s\S]+?)\\\)/g, "$1");
  s = s.replace(/\{([a-zA-Z0-9_+\-.]+)\}/g, "$1");

  // Remove leftover backslashes before known LaTeX keywords
  LATEX_KEYWORDS_FOR_CLEANING.forEach(kw => {
    s = s.replace(new RegExp("\\\\" + kw, "g"), kw);
  });

  // Strip literal stray dollars or curly braces
  s = s.replace(/[\${}]/g, "");

  // Normalize multiple spaces and newlines
  s = s.replace(/[ \t]+/g, " ");
  s = s.replace(/\n\s*\n+/g, "\n\n");

  return s.trim();
}

const LATEX_KEYWORDS_FOR_CLEANING = [
  "theta", "lambda", "alpha", "beta", "gamma", "Delta", "delta", "phi", "mu", "eta", "rho", "sigma", "omega", "tau",
  "infty", "hbar", "propto", "equiv", "sum", "int", "partial", "vec"
];

/**
 * Extracts and cleans theoretical sections (Aim, Theory, Formulas, Procedure, Conclusions, References)
 * from the authoritative EXPERIMENT_DETAILS repository.
 */
function getExperimentDetails(expCodeOrId) {
  if (!expCodeOrId) return null;
  const raw = String(expCodeOrId).toLowerCase().trim();

  // Normalize common code and ID aliases
  let normId = "projectile";
  if (raw.includes("diode")) normId = "diode";
  else if (raw.includes("pof") || raw.includes("attenuation")) normId = "pof-attenuation";
  else if (raw.includes("diffract")) normId = "diffraction";
  else if (raw.includes("hall")) normId = "hall-effect";
  else if (raw.includes("colour") || raw.includes("color")) normId = "colour-sensor";
  else if (raw.includes("optical") || raw.includes("aperture") || raw.includes("fibre") || raw.includes("fiber")) normId = "optical";
  else if (raw.includes("planck")) normId = "planck";
  else if (raw.includes("sandbox")) normId = "sandbox";
  else if (raw.includes("proj")) normId = "projectile";
  else if (EXPERIMENT_DETAILS[raw]) normId = raw;

  return EXPERIMENT_DETAILS[normId] || null;
}

/**
 * Renders the publication-grade bottom footer with page counter, vector atom logo, and PhysiX title.
 */
function renderBrandedFooter(doc, pageWidth, pageHeight, pageNum, totalPages) {
  const footerY = pageHeight - 14;
  const margin = 14;

  // Thin separator rule
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.25);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  // Bottom Left: Telemetry & Page Count
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `Official Virtual Physics Telemetry • Page ${pageNum} of ${totalPages}`,
    margin,
    footerY + 2.5
  );

  // Bottom Right: Vector PhysiX Logo + Tagline
  const brandBlockX = pageWidth - margin - 64;
  const logoCenterX = brandBlockX + 4;
  const logoCenterY = footerY + 1.8;

  drawVectorPhysixLogo(doc, logoCenterX, logoCenterY, 3.2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Physi", logoCenterX + 6, logoCenterY + 1);

  const physiWidth = doc.getTextWidth("Physi");
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text("X", logoCenterX + 6 + physiWidth, logoCenterY + 1);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("An Interactive Physics Laboratory", logoCenterX + 6, logoCenterY + 4.8);
}

/**
 * Universal Laboratory Observation & Telemetry PDF Export Engine
 * Generates academic-grade virtual laboratory reports.
 *
 * @param {Object} config - Configuration options
 * @returns {jsPDF} The generated jsPDF instance
 */
export function generateLabReportPdf(config = {}) {
  try {
    const expData = getExperimentDetails(config.experimentCode || config.experimentId || config.id || config.labTitle);

    // Normalize parameters across calling experiment modules
    const labTitle = config.labTitle || config.title || expData?.title || "PhysiX Experimental Logbook";
    const labSubtitle = config.labSubtitle || config.subtitle || expData?.shortDescription || "Laboratory Observation Report & Telemetry Record";
    const experimentCode = config.experimentCode || (expData ? `EXP-${expData.id.toUpperCase()}` : "EXP-01");
    const category = config.category || expData?.category || "PHYSICS LABORATORY";

    let studentName = config.studentName;
    let collegeName = (config.collegeName || config.college || "").trim();
    let studentEmail = config.studentEmail;
    let studentRole = config.studentRole;

    // Check localStorage profile fallback if missing, empty, or default
    try {
      let savedProfile = null;
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem("physix_user_profile");
        if (raw) savedProfile = JSON.parse(raw);
      }
      if (savedProfile && typeof savedProfile === "object") {
        if (!studentName || studentName.trim() === "" || studentName.toLowerCase() === "student physicist" || studentName.toLowerCase() === "guest student") {
          if (savedProfile.name && savedProfile.name.trim()) {
            studentName = savedProfile.name.trim();
          }
        }
        if (!collegeName || collegeName === "---" || collegeName.trim() === "") {
          const cVal = (savedProfile.college || savedProfile.occ || "").trim();
          if (cVal) {
            collegeName = cVal;
          }
        }
        if (!studentRole && savedProfile.edu) {
          studentRole = savedProfile.edu;
        }
      }
    } catch (e) {
      console.warn("Error reading profile fallback for PDF generation:", e);
    }

    studentName = (studentName && studentName.toLowerCase() !== "student physicist" && studentName.trim() !== "")
      ? studentName.trim()
      : "Guest Student";
    collegeName = (collegeName && collegeName.trim() !== "") ? collegeName.trim() : "---";
    studentEmail = studentEmail || "guest@physix.lab";
    studentRole = studentRole || "Student Researcher";

    // Aim & Apparatus
    const rawAim = config.aim || config.aimText || expData?.aim || "";
    const rawApparatus = config.apparatus || config.apparatusList || expData?.apparatus || "";
    const aim = cleanTextForPdf(rawAim);
    const apparatus = cleanTextForPdf(rawApparatus);

    // Theory & Formulas
    const rawTheory = config.theory || config.theoryText || expData?.theory || "";
    const rawFormulas = config.formulas || config.formulae || expData?.formulas || "";
    const theory = cleanTextForPdf(rawTheory);
    const formulas = cleanTextForPdf(rawFormulas);

    // Summary Metrics / KPIs
    const summaryMetrics = config.summaryMetrics || config.kpis || config.kpiCards || config.parameters || [];

    // Tables
    const tables = config.tables;
    const columns = config.columns || config.tableHeaders || [];
    const rows = config.rows || config.tableRows || [];

    // Graphs
    const graphs = config.graphs || [];
    if (config.graphCanvas && typeof config.graphCanvas.toDataURL === "function") {
      try {
        graphs.push({
          title: "Figure: Experimental Telemetry Plot",
          imageData: config.graphCanvas.toDataURL("image/png"),
          caption: "Live dynamic plot of experimental laboratory telemetry readings.",
          height: 60
        });
      } catch (_) {}
    }

    // Results & Conclusions
    const rawConclusions = config.conclusions || config.conclusionText || config.result || expData?.result || "";
    let conclusionText = "";
    if (Array.isArray(rawConclusions)) {
      conclusionText = rawConclusions.map(c => cleanTextForPdf(c)).join("\n");
    } else {
      conclusionText = cleanTextForPdf(rawConclusions);
    }

    // References (Exact 3 verified references from experiment data)
    const rawReferences = config.references || config.referenceBooks || expData?.referenceBooks || [];
    const references = Array.isArray(rawReferences)
      ? rawReferences.slice(0, 3).map(r => ({
          title: cleanTextForPdf(r.title || ""),
          source: cleanTextForPdf(r.source || ""),
          url: String(r.url || ""),
          description: cleanTextForPdf(r.description || "")
        }))
      : [];

    const orientation = config.orientation || "portrait";
    const filename = config.filename || `PhysiX_${experimentCode}_Report.pdf`;

    // Instantiate jsPDF in standard A4
    const doc = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 14;

    const ensureSpace = (neededHeight) => {
      if (currentY + neededHeight > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
    };

    // ==========================================
    // 1. TOP HEADER ACCENT BANNER (Midnight Blue)
    // ==========================================
    doc.setFillColor(15, 23, 42); // slate-900 / midnight blue
    doc.rect(0, 0, pageWidth, 24, "F");

    // Electric Cyan top accent strip
    doc.setFillColor(2, 132, 199); // sky-600 / electric cyan
    doc.rect(0, 0, pageWidth, 2.5, "F");

    // PhysiX Vector Atom Logo in Header
    drawVectorPhysixLogo(doc, margin + 4, 13, 4.8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("Physi", margin + 11.5, 14.5);

    const hPhysiWidth = doc.getTextWidth("Physi");
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text("X", margin + 11.5 + hPhysiWidth, 14.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("VIRTUAL PHYSICS LABORATORY", margin + 11.5 + hPhysiWidth + 4, 14.5);

    // Top-Right: Experiment Code Pill
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(pageWidth - margin - 32, 6.5, 32, 11, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248);
    doc.text(experimentCode, pageWidth - margin - 16, 13.5, { align: "center" });

    currentY = 32;

    // ==========================================
    // 2. REPORT TITLE & CATEGORY BADGE
    // ==========================================
    // Category kicker
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(2, 132, 199);
    doc.text(category.toUpperCase(), margin, currentY);
    currentY += 4.5;

    // Main Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14.5);
    doc.setTextColor(15, 23, 42);
    doc.text(labTitle, margin, currentY);
    currentY += 5.5;

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    const subtitleLines = doc.splitTextToSize(labSubtitle, contentWidth);
    doc.text(subtitleLines, margin, currentY);
    currentY += subtitleLines.length * 4 + 4;

    // ==========================================
    // 3. RESEARCHER DOSSIER & METADATA CARD (4-Compartment Grid)
    // ==========================================

    const cardHeight = 19;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, contentWidth, cardHeight, 2, 2, "FD");

    const halfWidth = contentWidth / 2;

    // Interior subtle divider lines
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    // Vertical divider
    doc.line(margin + halfWidth, currentY, margin + halfWidth, currentY + cardHeight);
    // Horizontal divider
    doc.line(margin, currentY + 9.5, margin + contentWidth, currentY + 9.5);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // Cell 1 (Top-Left): Student Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("STUDENT / RESEARCHER", margin + 4, currentY + 4);
    doc.setFont("helvetica", "bold");
    if (doc.getTextWidth(studentName) > halfWidth - 8) {
      doc.setFontSize(7.5);
    } else {
      doc.setFontSize(8.5);
    }
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(doc.splitTextToSize(studentName, halfWidth - 8)[0], margin + 4, currentY + 7.8);

    // Cell 2 (Top-Right): College Name (Displaying exactly "---" if unavailable)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("COLLEGE / INSTITUTION", margin + halfWidth + 4, currentY + 4);
    doc.setFont("helvetica", "bold");
    if (doc.getTextWidth(collegeName) > halfWidth - 8) {
      doc.setFontSize(7.5);
    } else {
      doc.setFontSize(8.5);
    }
    if (collegeName === "---") {
      doc.setTextColor(100, 116, 139);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(doc.splitTextToSize(collegeName, halfWidth - 8)[0], margin + halfWidth + 4, currentY + 7.8);

    // Cell 3 (Bottom-Left): Authentication & Role
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("AUTHENTICATION & ROLE", margin + 4, currentY + 13.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const authText = studentEmail ? `${studentEmail} • ${studentRole}` : `Guest Access • ${studentRole}`;
    doc.text(doc.splitTextToSize(authText, halfWidth - 8)[0], margin + 4, currentY + 16.8);

    // Cell 4 (Bottom-Right): Recorded Timestamp
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("RECORDED TIMESTAMP", margin + halfWidth + 4, currentY + 13.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`${dateStr} • ${timeStr}`, margin + halfWidth + 4, currentY + 16.8);

    currentY += cardHeight + 6;

    // ==========================================
    // 4. SUMMARY METRIC KPI TILES (IF PROVIDED)
    // ==========================================
    if (Array.isArray(summaryMetrics) && summaryMetrics.length > 0) {
      const tileGap = 3.5;
      const totalTiles = summaryMetrics.length;
      const tileWidth = (contentWidth - (totalTiles - 1) * tileGap) / totalTiles;
      const tileHeight = 13;

      summaryMetrics.forEach((metric, idx) => {
        const tileX = margin + idx * (tileWidth + tileGap);

        doc.setFillColor(241, 245, 249); // slate-100
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.25);
        doc.roundedRect(tileX, currentY, tileWidth, tileHeight, 1.8, 1.8, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        const labelText = String(metric.label || "METRIC").toUpperCase();
        doc.text(doc.splitTextToSize(labelText, tileWidth - 6)[0], tileX + 3.5, currentY + 4.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.8);
        if (metric.color && Array.isArray(metric.color) && metric.color.length === 3) {
          doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
        } else {
          doc.setTextColor(2, 132, 199);
        }
        doc.text(String(metric.value || "-"), tileX + 3.5, currentY + 10.2);
      });

      currentY += tileHeight + 6;
    }

    // ==========================================
    // 5. AIM & APPARATUS BLOCK
    // ==========================================
    if (aim || apparatus) {
      ensureSpace(24);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);

      const aimLines = aim ? doc.splitTextToSize(`AIM: ${aim}`, contentWidth - 8) : [];
      const appLines = apparatus ? doc.splitTextToSize(`APPARATUS: ${apparatus}`, contentWidth - 8) : [];
      const totalTextLines = aimLines.length + appLines.length;
      const boxHeight = Math.max(14, totalTextLines * 3.6 + 6);

      doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, "FD");

      let textY = currentY + 4.5;
      if (aimLines.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(30, 41, 59);
        doc.text(aimLines, margin + 4, textY);
        textY += aimLines.length * 3.6 + 1.5;
      }
      if (appLines.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(appLines, margin + 4, textY);
      }

      currentY += boxHeight + 6;
    }

    // ==========================================
    // 6. THEORETICAL BACKGROUND SECTION
    // ==========================================
    if (theory) {
      // Clean and extract readable paragraphs from theory
      const theoryParas = theory.split(/\n+/).map(p => p.trim()).filter(p => p.length > 20);
      const topParas = theoryParas.slice(0, 3);

      if (topParas.length > 0) {
        ensureSpace(22);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text("THEORETICAL PRINCIPLES", margin, currentY);
        currentY += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(51, 65, 85);

        topParas.forEach(p => {
          const pLines = doc.splitTextToSize(p, contentWidth);
          ensureSpace(pLines.length * 3.5 + 4);
          doc.text(pLines, margin, currentY);
          currentY += pLines.length * 3.5 + 2.5;
        });

        currentY += 3;
      }
    }

    // ==========================================
    // 7. GOVERNING FORMULAE BOX
    // ==========================================
    if (formulas) {
      const formulaLines = formulas.split(/\n+/).map(f => f.trim()).filter(f => f.length > 5).slice(0, 4);

      if (formulaLines.length > 0) {
        ensureSpace(20);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text("GOVERNING MATHEMATICAL FORMULAE", margin, currentY);
        currentY += 4.5;

        // Container card for formulas
        const fBoxHeight = formulaLines.length * 5.2 + 5;
        doc.setFillColor(241, 245, 249); // slate-100
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.25);
        doc.roundedRect(margin, currentY, contentWidth, fBoxHeight, 2, 2, "FD");

        doc.setFont("courier", "bold");
        doc.setFontSize(7.8);
        doc.setTextColor(15, 23, 42);

        formulaLines.forEach((fLine, fIdx) => {
          doc.text(`[${fIdx + 1}]  ${fLine}`, margin + 5, currentY + 5.2 + fIdx * 5.2);
        });

        currentY += fBoxHeight + 6;
      }
    }

    // ==========================================
    // 8. STRUCTURED OBSERVATION TABLES (AUTOTABLE)
    // ==========================================
    const renderTable = (tblCols, tblRows, title = "") => {
      if (title) {
        ensureSpace(14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(title, margin, currentY);
        currentY += 4.5;
      }

      // Sanitize all cell content to prevent corrupted entities or raw syntax
      const cleanCols = (tblCols || []).map(c => cleanTextForPdf(String(c)));
      const cleanRows = (tblRows || []).map(row => 
        (Array.isArray(row) ? row : [row]).map(cell => cleanTextForPdf(String(cell !== undefined && cell !== null ? cell : "-")))
      );

      const tableOptions = {
        startY: currentY,
        margin: { left: margin, right: margin, bottom: 20 },
        head: [cleanCols],
        body: cleanRows.length > 0 ? cleanRows : [cleanCols.map(() => "-")],
        theme: "grid",
        headStyles: {
          fillColor: [15, 23, 42], // slate-900 / midnight blue
          textColor: [255, 255, 255],
          font: "helvetica",
          fontStyle: "bold",
          fontSize: 7.8,
          cellPadding: 2.2,
          halign: "center",
          valign: "middle",
          lineColor: [51, 65, 85],
          lineWidth: 0.2
        },
        bodyStyles: {
          font: "helvetica",
          fontSize: 7.2,
          textColor: [30, 41, 59],
          cellPadding: 2,
          halign: "center",
          valign: "middle",
          lineColor: [226, 232, 240],
          lineWidth: 0.15
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // slate-50
        },
        styles: {
          overflow: "linebreak",
          cellWidth: "auto"
        }
      };

      if (typeof autoTable === "function") {
        autoTable(doc, tableOptions);
      } else if (doc.autoTable) {
        doc.autoTable(tableOptions);
      }

      currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 6.5;
    };

    if (Array.isArray(tables) && tables.length > 0) {
      tables.forEach(tbl => {
        renderTable(tbl.columns || [], tbl.rows || [], tbl.title || "");
      });
    } else if (columns && columns.length > 0) {
      renderTable(columns, rows, "Table 1: Scientific Telemetry & Experimental Observations");
    }

    // ==========================================
    // 9. SCIENTIFIC GRAPHS (IF PROVIDED)
    // ==========================================
    if (Array.isArray(graphs) && graphs.length > 0) {
      graphs.forEach(g => {
        const imgW = g.width || contentWidth;
        const imgH = g.height || 58;
        const requiredSpace = imgH + 16;

        ensureSpace(requiredSpace);

        if (g.title) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(cleanTextForPdf(g.title), margin, currentY);
          currentY += 4;
        }

        if (g.imageData) {
          try {
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, currentY, imgW, imgH, 2, 2, "FD");

            doc.addImage(g.imageData, "PNG", margin + 1, currentY + 1, imgW - 2, imgH - 2);
            currentY += imgH + 2;

            if (g.caption) {
              doc.setFont("helvetica", "italic");
              doc.setFontSize(6.8);
              doc.setTextColor(100, 116, 139);
              doc.text(cleanTextForPdf(g.caption), margin + 2, currentY + 3.5);
              currentY += 5.5;
            } else {
              currentY += 3;
            }
          } catch (imgErr) {
            console.warn("[PDF Export] Could not embed graph image:", imgErr);
          }
        }
      });
    }

    // ==========================================
    // 10. RESULTS & CONCLUSIONS SECTION
    // ==========================================
    if (conclusionText) {
      ensureSpace(24);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("EXPERIMENTAL RESULTS & CONCLUSIONS", margin, currentY);
      currentY += 4.5;

      const cLines = doc.splitTextToSize(conclusionText, contentWidth - 8);
      const cBoxHeight = Math.max(14, cLines.length * 3.5 + 6);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.25);
      doc.roundedRect(margin, currentY, contentWidth, cBoxHeight, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(cLines, margin + 4, currentY + 4.5);

      currentY += cBoxHeight + 6;
    }

    // ==========================================
    // 11. REFERENCES & FURTHER READING (EXACT 3)
    // ==========================================
    if (references.length > 0) {
      ensureSpace(28);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("REFERENCES & FURTHER READING", margin, currentY);
      currentY += 4.5;

      references.forEach((ref, rIdx) => {
        ensureSpace(12);

        // Reference title & source
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`[${rIdx + 1}]  ${ref.title}`, margin, currentY);

        if (ref.source) {
          const tWidth = doc.getTextWidth(`[${rIdx + 1}]  ${ref.title}`);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text(` - ${ref.source}`, margin + tWidth, currentY);
        }
        currentY += 3.6;

        // Description
        if (ref.description) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(71, 85, 105);
          const descLines = doc.splitTextToSize(ref.description, contentWidth - 6);
          doc.text(descLines, margin + 4, currentY);
          currentY += descLines.length * 3.2;
        }

        // Clickable URL Link
        if (ref.url) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.8);
          doc.setTextColor(2, 132, 199); // sky-600
          doc.textWithLink(ref.url, margin + 4, currentY, { url: ref.url });
          currentY += 4.2;
        } else {
          currentY += 1.5;
        }
      });
    }

    // ==========================================
    // 12. BRANDED FOOTER ON ALL PAGES
    // ==========================================
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      renderBrandedFooter(doc, pageWidth, pageHeight, p, totalPages);
    }

    // Save if running in browser environment with document/window
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      doc.save(filename);
    }

    return doc;
  } catch (err) {
    console.error("Error generating PhysiX lab report PDF:", err);
    throw err;
  }
}
