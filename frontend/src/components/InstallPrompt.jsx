import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

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
  const isMobile = useIsMobile();
  const location = useLocation();
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

  // Don't cover the login/register forms — those pages are transient.
  if (!show || location.pathname.endsWith("/login")) return null;

  // Float in the bottom-LEFT corner (chat bubble lives bottom-right); sit above the
  // mobile bottom nav when present.
  return (
    <div style={{
      position: "fixed", zIndex: 400,
      left: isMobile ? 12 : 24,
      bottom: isMobile ? "calc(86px + env(safe-area-inset-bottom, 0px))" : 24,
      width: "min(300px, calc(100vw - 24px))",
      background: "linear-gradient(135deg, #1e293b, #221645)",
      border: "1px solid #3b82f655",
      borderRadius: 16,
      boxShadow: "0 10px 40px #000000aa",
      padding: 14,
      animation: "fhSlideUp 0.25s ease-out",
    }}>
      <button onClick={dismiss} aria-label="Dismiss" style={{
        position: "absolute", top: 8, right: 8,
        background: "transparent", border: "none",
        color: "#64748b", fontSize: 16, cursor: "pointer", padding: 4, lineHeight: 1,
      }}>✕</button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, paddingRight: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, flexShrink: 0,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21,
        }}>📊</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#f1f5f9" }}>Install FinHealth AI</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.35 }}>
            {ios
              ? "Tap Share, then “Add to Home Screen”."
              : "Full-screen app on your home screen."}
          </div>
        </div>
      </div>

      {!ios && (
        <button onClick={install} style={{
          width: "100%",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff",
          padding: "10px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
        }}>⬇ Install App</button>
      )}
    </div>
  );
}
