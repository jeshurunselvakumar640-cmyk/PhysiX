/**
 * PhysiX — Offline Detection & Network Status Manager
 * Handles online/offline transitions, network quality detection, and UI indicators.
 */

import { setNetworkStatusOverride as setNetworkStatusOverrideUDS } from "./user-data-service.js";

let isOnline = navigator.onLine;
let networkQuality = "unknown"; // "online" | "offline" | "slow" | "unknown"
let networkChangeCallbacks = new Set();
let onlineCheckInterval = null;
let isChecking = false;

// Re-export the network status override function from user-data-service
export function setNetworkStatusOverride(fn) {
  return setNetworkStatusOverrideUDS(fn);
}

/**
 * Check actual network connectivity by making a lightweight request
 */
async function checkActualConnectivity() {
  if (isChecking) return isOnline;
  isChecking = true;

  try {
    // Use a lightweight, cache-busted request to a reliable endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("/manifest.webmanifest?v=" + Date.now(), {
      method: "HEAD",
      cache: "no-cache",
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    isChecking = false;
    return res.ok || res.type === "opaque";
  } catch (e) {
    isChecking = false;
    return false;
  }
}

/**
 * Update network status and notify callbacks
 */
async function updateNetworkStatus() {
  const wasOnline = isOnline;
  const browserOnline = navigator.onLine;

  if (!browserOnline) {
    isOnline = false;
    networkQuality = "offline";
  } else {
    const actuallyOnline = await checkActualConnectivity();
    isOnline = actuallyOnline;
    networkQuality = actuallyOnline ? "online" : "offline";
  }

  if (wasOnline !== isOnline) {
    console.log(`[Network] Status changed: ${wasOnline ? "online" : "offline"} -> ${isOnline ? "online" : "offline"}`);
    networkChangeCallbacks.forEach(cb => {
      try { cb(isOnline, networkQuality); } catch (e) {}
    });

    // Dispatch custom event for other modules
    window.dispatchEvent(new CustomEvent("physix-network-change", {
      detail: { isOnline, networkQuality, previous: wasOnline }
    }));
  }

  return isOnline;
}

/**
 * Start periodic connectivity checks
 */
function startNetworkMonitoring(intervalMs = 30000) {
  if (onlineCheckInterval) clearInterval(onlineCheckInterval);
  onlineCheckInterval = setInterval(updateNetworkStatus, intervalMs);
  
  // Also listen to browser events
  window.addEventListener("online", () => {
    console.log("[Network] Browser 'online' event fired");
    updateNetworkStatus();
  });
  
  window.addEventListener("offline", () => {
    console.log("[Network] Browser 'offline' event fired");
    isOnline = false;
    networkQuality = "offline";
    networkChangeCallbacks.forEach(cb => cb(false, "offline"));
    window.dispatchEvent(new CustomEvent("physix-network-change", {
      detail: { isOnline: false, networkQuality: "offline" }
    }));
  });
  
  // Initial check
  updateNetworkStatus();
}

/**
 * Stop network monitoring
 */
function stopNetworkMonitoring() {
  if (onlineCheckInterval) {
    clearInterval(onlineCheckInterval);
    onlineCheckInterval = null;
  }
}

/**
 * Subscribe to network changes
 */
function onNetworkChange(callback) {
  networkChangeCallbacks.add(callback);
  return () => networkChangeCallbacks.delete(callback);
}

/**
 * Get current network status
 */
function getNetworkStatus() {
  return {
    isOnline,
    networkQuality,
    browserOnline: navigator.onLine
  };
}

/**
 * Force a network check
 */
async function forceNetworkCheck() {
  return await updateNetworkStatus();
}

/**
 * Check if we should allow cloud operations
 * Returns true only if we're confidently online
 */
function canPerformCloudOperation() {
  return isOnline && networkQuality !== "offline";
}

/**
 * Service Worker registration with update handling
 */
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.log("[PWA] Service Worker not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });

    console.log("[PWA] Service Worker registered:", registration.scope);
    registration.update().catch(() => {});

    // Handle updates via updateManager rather than abrupt automatic reload
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          console.log("[PWA] New version installed and waiting for user refresh.");
          if (typeof window !== "undefined" && window.__PHYSIX_NOTIFY_UPDATE__) {
            window.__PHYSIX_NOTIFY_UPDATE__("Service Worker ready");
          }
        }
      });
    });

    // Check for updates periodically
    setInterval(() => {
      registration.update().catch(() => {});
    }, 15 * 60 * 1000); // Every 15 minutes


    // Cache current page scripts and styles once SW is active
    if (navigator.onLine) {
      cacheCurrentPageAssets().catch(() => {});
    }

    return registration;
  } catch (err) {
    console.error("[PWA] Service Worker registration failed:", err);
    return null;
  }
}

/**
 * Proactively cache all currently loaded scripts, stylesheets, and assets
 * into runtime cache to ensure instant offline availability even on first visit
 */
async function cacheCurrentPageAssets() {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open("physix-runtime-v3");
    const urls = new Set([
      window.location.origin + "/",
      window.location.origin + "/index.html",
      window.location.origin + "/manifest.webmanifest",
      window.location.origin + "/favicon.svg",
      window.location.origin + "/icons.svg",
      window.location.origin + "/cursor.png",
      window.location.origin + "/offline.html",
      window.location.origin + "/quiz.json"
    ]);

    // All active script tags on current page
    document.querySelectorAll("script[src]").forEach((s) => {
      if (s.src) {
        urls.add(s.src);
        try {
          const u = new URL(s.src);
          urls.add(u.origin + u.pathname);
        } catch (e) {}
      }
    });

    // All active stylesheet links on current page
    document.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      if (l.href) {
        urls.add(l.href);
        try {
          const u = new URL(l.href);
          urls.add(u.origin + u.pathname);
        } catch (e) {}
      }
    });

    // Cache them in background
    await Promise.allSettled(
      Array.from(urls).map(async (url) => {
        try {
          const res = await fetch(url, { cache: "no-cache" });
          if (res.ok) {
            await cache.put(url, res.clone());
            const parsed = new URL(url);
            if (parsed.search) {
              await cache.put(parsed.origin + parsed.pathname, res);
            }
          }
        } catch (e) {}
      })
    );
    console.log("[PWA] Proactively cached page assets for offline use:", urls.size);
  } catch (err) {
    console.warn("[PWA] Asset caching warning:", err);
  }
}

/**
 * Show a toast notification (uses existing showToast if available)
 */
function showToast(message) {
  const toastEl = document.getElementById("toast");
  if (toastEl) {
    toastEl.textContent = message;
    toastEl.classList.remove("hidden");
    setTimeout(() => toastEl.classList.add("hidden"), 4000);
  } else {
    console.log("[Toast]", message);
  }
}

/**
 * Show Vectra AI offline message in the AI chat
 */
function showAiOfflineMessage() {
  const aiChatMessages = document.getElementById("ai-chat-messages");
  if (aiChatMessages) {
    const offlineMsg = document.createElement("div");
    offlineMsg.className = "ai-msg ai-msg-bot ai-offline-notice";
    offlineMsg.innerHTML = `
      <div class="ai-msg-avatar">
        <svg class="svg-icon svg-icon-sm" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
      </div>
      <div class="ai-msg-content">
        <div class="ai-msg-header">
          <strong>Vectra AI</strong> <span class="ai-msg-time">Offline</span>
        </div>
        <p>Vectra AI requires an active internet connection and is currently unavailable offline. All experiment simulators, sandbox controls, formulas, and theory manuals remain fully functional in offline mode.</p>
      </div>
    `;
    aiChatMessages.appendChild(offlineMsg);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }
}

/**
 * Initialize offline UI indicator
 */
function initOfflineIndicator() {
  // Create offline indicator element
  let indicator = document.getElementById("physix-offline-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "physix-offline-indicator";
    indicator.className = "physix-offline-indicator hidden";
    indicator.setAttribute("role", "status");
    indicator.setAttribute("aria-live", "polite");
    indicator.innerHTML = `
      <div class="offline-indicator-content">
        <span class="offline-status-dot"></span>
        <div class="offline-text-group">
          <span class="offline-title">Offline Mode</span>
          <span class="offline-desc">Simulator & Learning Active • Cloud Sync Paused</span>
        </div>
      </div>
    `;
    document.body.appendChild(indicator);
  }

  // Listen for network changes
  onNetworkChange((online, quality) => {
    if (!online) {
      indicator.classList.remove("hidden");
      document.body.classList.add("physix-offline");
    } else {
      indicator.classList.add("hidden");
      document.body.classList.remove("physix-offline");
    }
  });

  // Initial state
  if (!isOnline) {
    indicator.classList.remove("hidden");
    document.body.classList.add("physix-offline");
  }
}

/**
 * Initialize the complete PWA system
 */
export async function initPwaSystem() {
  console.log("[PWA] Initializing PhysiX PWA System...");
  
  // Start network monitoring
  startNetworkMonitoring(30000);
  
  // Register Service Worker
  await registerServiceWorker();

  // Proactively cache all current page assets if online
  if (navigator.onLine) {
    cacheCurrentPageAssets().catch(() => {});
  }
  
  // Initialize offline indicator
  initOfflineIndicator();
  
  console.log("[PWA] PhysiX PWA System initialized");
  return {
    getNetworkStatus,
    onNetworkChange,
    canPerformCloudOperation,
    forceNetworkCheck,
    stopNetworkMonitoring,
    cacheCurrentPageAssets
  };
}

// Export functions for use in other modules
export {
  getNetworkStatus,
  onNetworkChange,
  canPerformCloudOperation,
  forceNetworkCheck,
  startNetworkMonitoring,
  stopNetworkMonitoring,
  registerServiceWorker,
  initOfflineIndicator,
  showAiOfflineMessage,
  cacheCurrentPageAssets
};

// Default export for convenience
export default {
  getNetworkStatus,
  onNetworkChange,
  canPerformCloudOperation,
  forceNetworkCheck,
  startNetworkMonitoring,
  stopNetworkMonitoring,
  registerServiceWorker,
  initOfflineIndicator,
  showAiOfflineMessage,
  cacheCurrentPageAssets
};