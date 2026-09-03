/**
 * PhysiX • Universal Lab Observation PDF Export Engine
 * Generates crisp, academic virtual physics laboratory observation reports.
 * 100% Zero Emojis compliant.
 * Features branded header, student dossier, KPI summary cards, structured data tables,
 * and bottom-right vector PhysiX logo, brand title, and tagline.
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Draw a smoothly rotated vector ellipse in jsPDF using trigonometric parametric segments
 * @param {jsPDF} doc - jsPDF instance
 * @param {number} cx - center x in mm
 * @param {number} cy - center y in mm
 * @param {number} rx - semi-major radius in mm
 * @param {number} ry - semi-minor radius in mm
 * @param {number} angleDeg - rotation angle in degrees
 */
function drawRotatedEllipse(doc, cx, cy, rx, ry, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const steps = 36;
  let prevX = cx + (rx * cosA);
  let prevY = cy + (rx * sinA);

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
 * @param {jsPDF} doc - jsPDF instance
 * @param {number} cx - center x in mm
 * @param {number} cy - center y in mm
 * @param {number} size - radius scale in mm
 */
function drawVectorPhysixLogo(doc, cx, cy, size = 5) {
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

  // Core Nucleus (Glowing layered circle)
  doc.setFillColor(56, 189, 248);
  doc.circle(cx, cy, size * 0.28, "F");

  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, size * 0.12, "F");

  try {
    doc.restoreGraphicsState();
  } catch (e) {}
}

/**
 * Render Bottom-Right Corner PhysiX Branding & Tagline
 * @param {jsPDF} doc 
 * @param {number} pageWidth 
 * @param {number} pageHeight 
 * @param {number} pageNum 
 * @param {number} totalPages 
 */
function renderBrandedFooter(doc, pageWidth, pageHeight, pageNum, totalPages) {
  const footerY = pageHeight - 16;
  const margin = 14;

  // Subtle separator rule
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  // Bottom Left: Telemetry & Page Count
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `Official Virtual Physics Telemetry • Page ${pageNum} of ${totalPages}`,
    margin,
    footerY + 3
  );

  // Bottom Right: PhysiX Logo + Brand Text + Tagline
  const brandBlockX = pageWidth - margin - 62;
  const logoCenterX = brandBlockX + 5;
  const logoCenterY = footerY + 2.5;

  // Draw Logo
  drawVectorPhysixLogo(doc, logoCenterX, logoCenterY, 3.8);

  // Draw Brand Title "PhysiX"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Physi", logoCenterX + 7, logoCenterY + 1);

  const physiWidth = doc.getTextWidth("Physi");
  doc.setTextColor(2, 132, 199); // sky-600
  doc.text("X", logoCenterX + 7 + physiWidth, logoCenterY + 1);

  // Draw Tagline "An Interactive Physics Laboratory"
  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text("An Interactive Physics Laboratory", logoCenterX + 7, logoCenterY + 5.2);
}

/**
 * Generate and download an academic laboratory observation report in PDF
 * @param {Object} config
 */
export function generateLabReportPdf(config = {}) {
  try {
    const {
      labTitle = "PhysiX Experimental Logbook",
      labSubtitle = "Laboratory Observation Report & Telemetry Record",
      experimentCode = "EXP-01",
      studentName = "Student Physicist",
      studentEmail = "guest@physix.lab",
      studentRole = "Student Researcher",
      summaryMetrics = [],
      columns = [],
      rows = [],
      filename = "PhysiX_Observation_Report.pdf",
      orientation = "portrait"
    } = config;

    const doc = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    let currentY = 14;

    // ==========================================
    // 1. TOP HEADER ACCENT BAR & TITLE
    // ==========================================
    // Top header banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 24, "F");

    // Cyan top edge strip
    doc.setFillColor(2, 132, 199); // cyan/sky
    doc.rect(0, 0, pageWidth, 2.5, "F");

    // PhysiX Logo in Header
    drawVectorPhysixLogo(doc, margin + 4, 13, 5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("Physi", margin + 12, 14.5);

    const hPhysiWidth = doc.getTextWidth("Physi");
    doc.setTextColor(56, 189, 248);
    doc.text("X", margin + 12 + hPhysiWidth, 14.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("VIRTUAL PHYSICS LABORATORY", margin + 12 + hPhysiWidth + 5, 14.5);

    // Experiment Code Pill on Top Right
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - margin - 26, 6.5, 26, 11, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(56, 189, 248);
    doc.text(experimentCode, pageWidth - margin - 13, 13.5, { align: "center" });

    currentY = 32;

    // ==========================================
    // 2. REPORT TITLE & EXPERIMENTAL TOPIC
    // ==========================================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text(labTitle, margin, currentY);
    currentY += 5.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(labSubtitle, margin, currentY);
    currentY += 8;

    // ==========================================
    // 3. STUDENT DOSSIER & METADATA CARD
    // ==========================================
    const cardHeight = 19;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.35);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, cardHeight, 2.5, 2.5, "FD");

    const colWidth = (pageWidth - margin * 2) / 3;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    // Metadata Col 1: Student
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("RESEARCHER / STUDENT", margin + 6, currentY + 6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(studentName || "Student Physicist", margin + 6, currentY + 13);

    // Metadata Col 2: Email & Role
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("AUTHENTICATION & IDENTITY", margin + colWidth + 4, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(studentEmail ? `${studentEmail} (${studentRole})` : `Guest Mode (${studentRole})`, margin + colWidth + 4, currentY + 13);

    // Metadata Col 3: Date & Total Readings
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("LOGGED TIMESTAMP", margin + colWidth * 2 + 4, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${dateStr} • ${timeStr}`, margin + colWidth * 2 + 4, currentY + 13);

    currentY += cardHeight + 8;

    // ==========================================
    // 4. SUMMARY METRIC KPI TILES (IF PROVIDED)
    // ==========================================
    if (summaryMetrics && summaryMetrics.length > 0) {
      const tileGap = 4;
      const totalTiles = summaryMetrics.length;
      const tileWidth = (pageWidth - margin * 2 - (totalTiles - 1) * tileGap) / totalTiles;
      const tileHeight = 14;

      summaryMetrics.forEach((metric, idx) => {
        const tileX = margin + idx * (tileWidth + tileGap);

        doc.setFillColor(241, 245, 249); // slate-100
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.25);
        doc.roundedRect(tileX, currentY, tileWidth, tileHeight, 1.8, 1.8, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.8);
        doc.setTextColor(100, 116, 139);
        doc.text(metric.label.toUpperCase(), tileX + 4, currentY + 4.8);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        if (metric.color && Array.isArray(metric.color) && metric.color.length === 3) {
          doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
        } else {
          doc.setTextColor(2, 132, 199);
        }
        doc.text(String(metric.value), tileX + 4, currentY + 11);
      });

      currentY += tileHeight + 7;
    }

    // ==========================================
    // 5. STRUCTURED OBSERVATION TABLE (AUTOTABLE)
    // ==========================================
    const tableOptions = {
      startY: currentY,
      margin: { left: margin, right: margin, bottom: 22 },
      head: [columns],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 2.8,
        halign: "center",
        valign: "middle",
        lineColor: [51, 65, 85],
        lineWidth: 0.2
      },
      bodyStyles: {
        font: "helvetica",
        fontSize: 7.5,
        textColor: [30, 41, 59],
        cellPadding: 2.5,
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

    // ==========================================
    // 6. BRANDED FOOTER WITH LOGO & TAGLINE
    // ==========================================
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      renderBrandedFooter(doc, pageWidth, pageHeight, p, totalPages);
    }

    // Save / Download PDF
    doc.save(filename);
  } catch (err) {
    console.error("Error generating PhysiX lab report PDF:", err);
    throw err;
  }
}
