import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const DISMISS_KEY = "fh_install_dismissed_v2";

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream;
}
function isAndroid() {
  return /android/i.test(window.navigator.userAgent);
}
function isStandalone() {
  return (
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true
  );
}

// Bottom-left floating card prompting the user to install the app.
// - If the browser fired `beforeinstallprompt`, the button triggers the native install.
// - Otherwise it shows platform-specific manual instructions (so it's always useful).
export default function InstallPrompt() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [deferred, setDeferred] = useState(typeof window !== "undefined" ? window.__deferredInstallPrompt : null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;                                   // already installed
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;

    if (window.__deferredInstallPrompt) { setDeferred(window.__deferredInstallPrompt); setShow(true); }

    const onInstallable = () => { setDeferred(window.__deferredInstallPrompt); setShow(true); };
    const onInstalled = () => { setShow(false); sessionStorage.setItem(DISMISS_KEY, "1"); };
    window.addEventListener("fh-installable", onInstallable);
    window.addEventListener("appinstalled", onInstalled);

    // Fallback: show the card even if the browser never fires the install event
    // (Safari/Firefox, or Chrome heuristics) so the user can still install manually.
    const t = setTimeout(() => setShow(true), 1200);

    return () => {
      clearTimeout(t);
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

  const dismiss = () => { setShow(false); sessionStorage.setItem(DISMISS_KEY, "1"); };

  // Don't cover the login/register forms — those pages are transient.
  if (!show || location.pathname.endsWith("/login")) return null;

  const canPrompt = !!deferred;
  // Shell pages have the chat bubble + bottom nav on the right/bottom — sit above them.
  const isShell = location.pathname.startsWith("/owner") || location.pathname.startsWith("/manager");
  const instruction = isIOS()
    ? "Tap the Share icon, then “Add to Home Screen”."
    : isAndroid()
      ? "Open the browser menu (⋮), then “Add to Home screen” / “Install app”."
      : "Click the install (⊕) icon in the address bar, or the menu (⋮) → “Install FinHealth AI”.";

  return (
    <div style={{
      position: "fixed", zIndex: 400,
      right: isMobile ? 12 : 24,
      bottom: isMobile
        ? (isShell ? "calc(150px + env(safe-area-inset-bottom, 0px))" : "calc(20px + env(safe-area-inset-bottom, 0px))")
        : (isShell ? 96 : 24),
      width: "min(300px, calc(100vw - 24px))",
      background: "linear-gradient(135deg, #1e293b, #221645)",
      border: "1px solid #3b82f566",
      borderRadius: 16,
      boxShadow: "0 12px 40px #000000aa",
      padding: 14,
      animation: "fhSlideUp 0.3s ease-out, fhPulseGlow 2.4s ease-in-out 0.5s infinite",
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
            {canPrompt ? "Full-screen app on your home screen." : instruction}
          </div>
        </div>
      </div>

      {canPrompt ? (
        <button onClick={install} style={{
          width: "100%",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff",
          padding: "10px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
        }}>⬇ Install App</button>
      ) : (
        <button onClick={dismiss} style={{
          width: "100%",
          background: "transparent", border: "1px solid #334155", color: "#94a3b8",
          padding: "9px", borderRadius: 10, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
        }}>Got it</button>
      )}
    </div>
  );
}
