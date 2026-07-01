import React, { useEffect, useState } from "react";

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}
function isStandalone() {
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

// Top banner prompting the user to install the app. Shows a working "Install"
// button on Chrome/Android (via beforeinstallprompt) and a manual hint on iOS.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(typeof window !== "undefined" ? window.__deferredInstallPrompt : null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;                                   // already installed
    if (sessionStorage.getItem("fh_install_dismissed") === "1") return;

    if (window.__deferredInstallPrompt) { setDeferred(window.__deferredInstallPrompt); setShow(true); }
    if (isIOS()) { setIos(true); setShow(true); }                 // iOS has no install event

    const onInstallable = () => { setDeferred(window.__deferredInstallPrompt); setShow(true); };
    const onInstalled = () => { setShow(false); sessionStorage.setItem("fh_install_dismissed", "1"); };
    window.addEventListener("fh-installable", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("fh-installable", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch (e) { /* ignore */ }
    window.__deferredInstallPrompt = null;
    setDeferred(null);
    setShow(false);
  };

  const dismiss = () => { setShow(false); sessionStorage.setItem("fh_install_dismissed", "1"); };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px calc(10px + env(safe-area-inset-top, 0px))",
      background: "linear-gradient(135deg, #1e3a5f, #2a1a55)",
      borderBottom: "1px solid #3b82f655",
      boxShadow: "0 4px 24px #00000066",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
      }}>📊</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#f1f5f9" }}>Install FinHealth AI</div>
        <div style={{ fontSize: 11.5, color: "#cbd5e1", overflow: "hidden", textOverflow: "ellipsis" }}>
          {ios
            ? "Tap the Share icon, then “Add to Home Screen”."
            : "Add to your home screen for a full-screen app experience."}
        </div>
      </div>

      {!ios && (
        <button onClick={install} style={{
          flexShrink: 0,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff",
          padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>Install</button>
      )}

      <button onClick={dismiss} aria-label="Dismiss" style={{
        flexShrink: 0, background: "transparent", border: "none",
        color: "#94a3b8", fontSize: 18, cursor: "pointer", padding: "4px 6px", lineHeight: 1,
      }}>✕</button>
    </div>
  );
}
