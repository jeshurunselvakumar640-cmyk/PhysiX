import fs from 'fs';
import path from 'path';
import { generateLabReportPdf } from '../src/pdf-export.js';

const EXPERIMENTS = [
  {
    code: "EXP-01",
    name: "Projectile Motion",
    config: {
      experimentCode: "EXP-01",
      labTitle: "2D Projectile Motion Kinematics Logbook",
      studentName: "Ada Lovelace",
      studentEmail: "ada@physix.lab",
      collegeName: "Oxford University Department of Physics",
      summaryMetrics: [
        { label: "Total Observations", value: "6 Runs" },
        { label: "Maximum Range", value: "85.20 m" },
        { label: "Max Apex Altitude", value: "32.14 m" }
      ],
      columns: ["Run #", "Launch Angle (deg)", "Velocity (m/s)", "Apex Height (m)", "Flight Time (s)", "Range (m)"],
      rows: [
        ["1", "30", "25.0", "7.97", "2.55", "55.23"],
        ["2", "45", "25.0", "15.94", "3.61", "63.78"],
        ["3", "60", "25.0", "23.92", "4.42", "55.23"],
        ["4", "45", "30.0", "22.96", "4.33", "91.84"]
      ]
    }
  },
  {
    code: "EXP-02",
    name: "Optical Fiber Numerical Aperture",
    config: {
      experimentCode: "EXP-02",
      labTitle: "Numerical Aperture of an Optical Fibre Logbook",
      studentName: "Marie Curie",
      studentEmail: "marie@physix.lab",
      summaryMetrics: [
        { label: "Mean NA", value: "0.2854" },
        { label: "Acceptance Angle", value: "16.6 deg" }
      ],
      columns: ["Reading #", "Distance L (mm)", "Spot Diameter W (mm)", "Calculated NA", "Acceptance Angle (deg)"],
      rows: [
        ["1", "10.0", "5.8", "0.2783", "16.2"],
        ["2", "15.0", "8.9", "0.2841", "16.5"],
        ["3", "20.0", "12.0", "0.2873", "16.7"],
        ["4", "25.0", "15.1", "0.2889", "16.8"]
      ]
    }
  },
  {
    code: "EXP-03",
    name: "Colour Sensor",
    config: {
      experimentCode: "EXP-03",
      labTitle: "Study of Colour Sensor (TCS3200) Logbook",
      studentName: "Isaac Newton",
      studentEmail: "newton@physix.lab",
      summaryMetrics: [
        { label: "Mean Spectral Fidelity", value: "98.4%" },
        { label: "Mean Frequency", value: "124.6 kHz" }
      ],
      columns: ["Color Swatch", "Red Freq (kHz)", "Green Freq (kHz)", "Blue Freq (kHz)", "Clear Freq (kHz)", "Dominant Match"],
      rows: [
        ["Red Sample", "185.4", "42.1", "38.6", "266.1", "RED (650 nm)"],
        ["Green Sample", "39.2", "172.5", "54.8", "266.5", "GREEN (530 nm)"],
        ["Blue Sample", "35.1", "61.3", "188.7", "285.1", "BLUE (470 nm)"]
      ]
    }
  },
  {
    code: "EXP-04",
    name: "Hall Effect",
    config: {
      experimentCode: "EXP-04",
      labTitle: "Hall Effect in Semiconductor & Metal Probes Logbook",
      studentName: "Edwin Hall",
      studentEmail: "hall@physix.lab",
      summaryMetrics: [
        { label: "Mean Hall Voltage", value: "-12.16 mV" },
        { label: "Carrier Density", value: "1.64e20 m^-3" },
        { label: "Magnetic Field", value: "0.80 T" }
      ],
      columns: ["Trial", "Specimen Material", "Probe Current (mA)", "Magnetic Field (T)", "Hall Voltage (mV)", "Carrier Type"],
      rows: [
        ["1", "N-type Germanium", "5.0", "0.20", "-3.04", "Electrons (n)"],
        ["2", "N-type Germanium", "5.0", "0.40", "-6.08", "Electrons (n)"],
        ["3", "N-type Germanium", "5.0", "0.60", "-9.12", "Electrons (n)"],
        ["4", "N-type Germanium", "5.0", "0.80", "-12.16", "Electrons (n)"]
      ]
    }
  },
  {
    code: "EXP-05-DIFFRACTION",
    name: "Diffraction Grating",
    config: {
      experimentCode: "EXP-05-DIFFRACTION",
      labTitle: "Diffraction Grating Wave Optics Telemetry Logbook",
      studentName: "Thomas Young",
      studentEmail: "young@physix.lab",
      kpis: [
        { label: "Computed Wavelength", value: "632.8 nm" },
        { label: "Grating Spacing d", value: "1.667 um" },
        { label: "Diffraction Order", value: "m = +/- 1, 2" }
      ],
      columns: ["Order (m)", "Left Position (cm)", "Right Position (cm)", "2x Distance (cm)", "Diffraction Angle (deg)", "Wavelength (nm)"],
      rows: [
        ["1", "12.4", "87.6", "75.2", "22.3", "632.8"],
        ["2", "25.1", "74.9", "49.8", "49.4", "633.1"]
      ]
    }
  },
  {
    code: "EXP-06-DIODE",
    name: "Diode V-I Characteristics",
    config: {
      experimentCode: "EXP-06-DIODE",
      labTitle: "Diode V-I Characteristics Laboratory Report",
      studentName: "William Shockley",
      studentEmail: "shockley@physix.lab",
      collegeName: "Stanford University",
      summaryMetrics: [
        { label: "Active Bias Mode", value: "FORWARD / REVERSE" },
        { label: "Forward Cut-in", value: "0.68 V" },
        { label: "Dynamic Resistance", value: "24.5 Ohm" }
      ],
      tables: [
        {
          title: "Table 1: Forward Bias P-N Junction Characteristics (Least Count: V = 0.025 V, mA = 0.2 mA)",
          columns: ["S.No.", "Forward Voltage Vf (Volt)", "Forward Current If (mA)"],
          rows: [
            ["1", "0.10", "0.00"],
            ["2", "0.30", "0.01"],
            ["3", "0.50", "0.05"],
            ["4", "0.60", "0.25"],
            ["5", "0.65", "0.95"],
            ["6", "0.70", "2.45"],
            ["7", "0.75", "4.60"],
            ["8", "0.80", "7.20"]
          ]
        },
        {
          title: "Table 2: Reverse Bias P-N Junction Characteristics (Least Count: V = 0.5 V, uA = 2 uA = 0.002 mA)",
          columns: ["S.No.", "Reverse Voltage Vr (Volt)", "Reverse Current Ir (mA)"],
          rows: [
            ["1", "2.0", "0.0001 (0.1 uA)"],
            ["2", "5.0", "0.0003 (0.3 uA)"],
            ["3", "10.0", "0.0005 (0.5 uA)"],
            ["4", "15.0", "0.0008 (0.8 uA)"],
            ["5", "20.0", "0.0010 (1.0 uA)"],
            ["6", "25.0", "0.0013 (1.3 uA)"],
            ["7", "30.0", "0.0015 (1.5 uA)"]
          ]
        }
      ]
    }
  },
  {
    code: "EXP-07",
    name: "Measuring Optical Power Attenuation in Plastic Optical Fiber",
    config: {
      experimentCode: "EXP-07",
      labTitle: "Optical Power Attenuation in Plastic Optical Fiber",
      studentName: "Charles Kao",
      studentEmail: "kao@physix.lab",
      kpiCards: [
        { label: "Reference Power (Pin)", value: "3.000 mW" },
        { label: "Transmitted Power (Pout)", value: "1.980 mW" },
        { label: "Total Loss (AdB)", value: "1.805 dB" },
        { label: "Attenuation Coeff (alpha)", value: "180.5 dB/km" }
      ],
      tableHeaders: ["S.No.", "Length (m)", "Pin (mW)", "Pout (mW)", "Total Loss (dB)", "alpha (dB/km)", "Condition"],
      tableRows: [
        ["1", "1.0", "3.000", "2.880", "0.177", "177.3", "Straight"],
        ["2", "2.0", "3.000", "2.760", "0.362", "181.0", "Straight"],
        ["3", "5.0", "3.000", "2.440", "0.899", "179.8", "Straight"],
        ["4", "10.0", "3.000", "1.980", "1.805", "180.5", "Straight"],
        ["5", "15.0", "3.000", "1.610", "2.704", "180.2", "Straight"],
        ["6", "20.0", "3.000", "1.310", "3.600", "180.0", "Straight"]
      ]
    }
  },
  {
    code: "EXP-SANDBOX",
    name: "Physics Sandbox",
    config: {
      experimentCode: "EXP-SANDBOX",
      labTitle: "Physics Sandbox & 2D Kinematics Playground",
      studentName: "Galileo Galilei",
      studentEmail: "galileo@physix.lab",
      summaryMetrics: [
        { label: "Active Bodies", value: "4 Bodies" },
        { label: "Gravity Field", value: "9.81 m/s^2" },
        { label: "Restitution Coeff", value: "e = 0.85" }
      ],
      columns: ["Object ID", "Type", "Mass (kg)", "Initial Velocity (m/s)", "Final Velocity (m/s)", "Kinetic Energy (J)"],
      rows: [
        ["Body-1", "Rigid Sphere", "2.5", "12.0", "8.4", "88.2"],
        ["Body-2", "Obstacle Block", "10.0", "0.0", "2.1", "22.0"]
      ]
    }
  }
];

const outDir = path.join(process.cwd(), 'test-output-pdfs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log("=== Generating and Auditing PDFs for All 8 Experiments ===");

let allPassed = true;

for (const exp of EXPERIMENTS) {
  console.log(`\nTesting: [${exp.code}] ${exp.name}...`);
  try {
    const doc = generateLabReportPdf(exp.config);
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const filePath = path.join(outDir, `${exp.code}_report.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);

    const numPages = doc.internal.getNumberOfPages();
    console.log(`  -> Generated PDF: ${filePath} (${numPages} pages, ${pdfBuffer.length} bytes)`);

    // Extract text stream from PDF buffer to inspect for defects
    const pdfText = pdfBuffer.toString('latin1');

    // 1. Check for &a&b&c&d&e defect
    if (pdfText.includes('&a&b') || pdfText.includes('&a&b&c&d&e')) {
      console.error(`  [FAIL] Contains malformed '&a&b' string in ${exp.code}!`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Zero '&a&b&c&d&e' defects.`);
    }

    // 2. Check for unintended raw HTML entities like &amp;, &lt;, &gt;, &nbsp;
    const rawEntities = pdfText.match(/&(amp|lt|gt|nbsp|quot);/g);
    if (rawEntities) {
      console.error(`  [FAIL] Contains raw unescaped HTML entities:`, rawEntities);
      allPassed = false;
    } else {
      console.log(`  [PASS] Zero unescaped HTML entities.`);
    }

    // 3. Check for raw LaTeX command artifacts like \frac{ or \sqrt{
    const rawLatex = pdfText.match(/\\(frac|sqrt|theta|lambda|alpha|approx)\{/g);
    if (rawLatex) {
      console.error(`  [FAIL] Contains raw unparsed LaTeX commands:`, rawLatex);
      allPassed = false;
    } else {
      console.log(`  [PASS] Zero raw LaTeX command artifacts.`);
    }

    // 4. Check for forbidden generic placeholder "Student Physicist"
    if (pdfText.includes("Student Physicist")) {
      console.error(`  [FAIL] Contains forbidden label 'Student Physicist' in ${exp.code}!`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Zero 'Student Physicist' occurrences.`);
    }

    // 5. Check for Student Name and College Name / '---' fallback
    if (exp.config.studentName && !pdfText.includes(exp.config.studentName)) {
      console.error(`  [FAIL] Missing student name '${exp.config.studentName}' in ${exp.code}!`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Correct student name present.`);
    }

    if (exp.config.collegeName) {
      if (!pdfText.includes(exp.config.collegeName)) {
        console.error(`  [FAIL] Missing provided college name '${exp.config.collegeName}' in ${exp.code}!`);
        allPassed = false;
      } else {
        console.log(`  [PASS] College name correctly displayed: ${exp.config.collegeName}`);
      }
    } else {
      if (!pdfText.includes("---")) {
        console.error(`  [FAIL] Missing exact '---' placeholder for omitted college in ${exp.code}!`);
        allPassed = false;
      } else {
        console.log(`  [PASS] Exact '---' placeholder displayed for omitted college.`);
      }
    }

    // 6. Check for page count > 0 and file size reasonable
    if (numPages < 1 || pdfBuffer.length < 5000) {
      console.error(`  [FAIL] PDF appears empty or truncated! Pages: ${numPages}, Size: ${pdfBuffer.length}`);
      allPassed = false;
    } else {
      console.log(`  [PASS] Valid page count (${numPages}) and healthy file size.`);
    }

  } catch (err) {
    console.error(`  [ERROR] Exception generating PDF for ${exp.code}:`, err);
    allPassed = false;
  }
}

console.log(`\n========================================`);
if (allPassed) {
  console.log("ALL EXPERIMENT PDFS GENERATED & VALIDATED SUCCESSFULLY!");
} else {
  console.error("SOME PDF CHECKS FAILED. SEE DETAILS ABOVE.");
  process.exit(1);
}
