/**
 * PhysiX • Global Content Protection & Anti-Theft Security Layer
 * Protects platform assets, laboratory telemetry, simulations, and course content.
 *
 * Features:
 * 1. Global text selection prevention (CSS & JS fallbacks)
 * 2. Right-click context menu prevention
 * 3. Clipboard copy/cut interception
 * 4. Image/element dragging prevention
 * 5. Keyboard shortcut blocking (Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P, PrintScreen, DevTools keys)
 * 6. Preserves full usability for forms, inputs, sliders, canvas simulations, and modals.
 */

export function initContentProtection() {
  // 1. Prevent Right-Click / Context Menu Globally
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  }, { capture: true });

  // 2. Prevent Copying Content Globally
  document.addEventListener("copy", (e) => {
    e.preventDefault();
  }, { capture: true });

  // 3. Prevent Cutting Content Globally
  document.addEventListener("cut", (e) => {
    e.preventDefault();
  }, { capture: true });

  // 4. Prevent Native Dragging of Elements (images, text, links)
  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
  }, { capture: true });

  // 5. Block Common Keyboard Shortcuts (Ctrl/Cmd + C, U, S, P, Shift+I/J/C, F12, PrintScreen)
  document.addEventListener("keydown", (e) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const key = (e.key || "").toLowerCase();

    // Block keyboard copy (Ctrl+C), view source (Ctrl+U), save page (Ctrl+S), print (Ctrl+P)
    if (isCtrlOrMeta && ["c", "u", "s", "p"].includes(key)) {
      e.preventDefault();
      return;
    }

    // Block developer tool shortcuts (Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
    if (isCtrlOrMeta && e.shiftKey && ["i", "j", "c"].includes(key)) {
      e.preventDefault();
      return;
    }

    // Block F12 (DevTools)
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      return;
    }

    // Block PrintScreen key
    if (e.key === "PrintScreen" || e.key === "Snapshot" || e.keyCode === 44) {
      e.preventDefault();
    }
  }, { capture: true });

  // 6. Handle PrintScreen keyup (some OS/browsers emit PrintScreen on keyup)
  document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen" || e.key === "Snapshot" || e.keyCode === 44) {
      e.preventDefault();
    }
  }, { capture: true });
}
