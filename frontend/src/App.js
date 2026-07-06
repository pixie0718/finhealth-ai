import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Landing from "./pages/landing/LandingMega";
import MSMEPortal from "./pages/MSMEPortal";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import ScoreHistory from "./pages/ScoreHistory";
import Settings from "./pages/Settings";
import HealthCard from "./components/HealthCard";
import ChatAssistant from "./components/ChatAssistant";
import ToolsHub from "./pages/ToolsHub";
import OwnerApplications from "./pages/OwnerApplications";
import DemoPortal from "./pages/DemoPortal";
import BottomNav from "./components/BottomNav";
import InstallPrompt from "./components/InstallPrompt";
import ThemeToggle from "./components/ThemeToggle";
import useIsMobile from "./hooks/useIsMobile";

// Short labels + icons for the mobile bottom tab bar (keys match the shells' tab state).
const MANAGER_BOTTOM = [
  { key: "Dashboard", label: "Home", icon: "🏠" },
  { key: "Score History", label: "History", icon: "📈" },
  { key: "New Application", label: "New", icon: "➕" },
  { key: "Tools", label: "Tools", icon: "🧰" },
  { key: "Settings", label: "Settings", icon: "⚙️" },
];
const OWNER_BOTTOM = [
  { key: "Check Eligibility", label: "Score", icon: "📊" },
  { key: "Applications", label: "Loans", icon: "📄" },
  { key: "Tools", label: "Tools", icon: "🧰" },
  { key: "Settings", label: "Settings", icon: "⚙️" },
];

const NAV_TABS = ["Dashboard", "Score History", "New Application", "Tools", "Settings"];

const navStyle = (active) => ({
  padding: "8px 20px",
  borderRadius: 8,
  background: active ? "#3b82f622" : "transparent",
  border: active ? "1px solid #3b82f644" : "1px solid transparent",
  color: active ? "#93c5fd" : "#64748b",
  fontSize: 13,
  fontWeight: active ? 600 : 400,
  cursor: "pointer",
});

const LoadingScreen = () => (
  <div style={{
    minHeight: "100vh", background: "var(--c-bg)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#475569", fontSize: 14,
  }}>
    Loading...
  </div>
);

// Route guard: gates an area to a single role. Redirects to the right login /
// the user's own home when the account doesn't match.
function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to={role === "banker" ? "/manager/login" : "/owner/login"} replace />;
  if (user.role !== role) return <Navigate to={user.role === "banker" ? "/manager" : "/owner"} replace />;
  return children;
}


// ─── Bank Manager shell (/manager) ──────────────────────────────────────────
function ManagerShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState("Dashboard");
  const [viewData, setViewData] = useState(null);
  const doLogout = () => { logout(); navigate("/"); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", paddingBottom: isMobile ? 74 : 0 }}>
      <div style={{
        borderBottom: "1px solid var(--c-border-soft)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        rowGap: 8,
        minHeight: 60,
        position: "sticky", top: 0,
        background: "var(--c-bg)",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🏦</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", lineHeight: 1 }}>FinHealth AI</div>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1 }}>Bank Manager Console</div>
          </div>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {NAV_TABS.map((t) => (
              <button key={t} style={navStyle(tab === t)} onClick={() => { setTab(t); setViewData(null); }}>
                {t}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#475569" }}>🏦 IDBI Bank</div>
          {user && <div style={{ fontSize: 12, color: "#475569" }}>👤 {user.full_name || user.email}</div>}
          <ThemeToggle />
          <button onClick={doLogout} style={{
            background: "transparent", border: "1px solid #ef444433",
            color: "#ef4444", padding: "5px 12px", borderRadius: 8,
            fontSize: 11, cursor: "pointer",
          }}>Logout</button>
        </div>
      </div>

      {viewData ? (
        <div>
          <div style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setViewData(null)} style={{
              background: "transparent", border: "1px solid var(--c-border)",
              color: "#94a3b8", padding: "6px 14px", borderRadius: 8,
              fontSize: 12, cursor: "pointer",
            }}>← Back</button>
            <span style={{ color: "#64748b", fontSize: 13 }}>Financial Health Card</span>
          </div>
          <HealthCard data={viewData} isManagerView={true} />
        </div>
      ) : tab === "Dashboard" ? (
        <Dashboard onView={setViewData} />
      ) : tab === "Score History" ? (
        <ScoreHistory onView={setViewData} />
      ) : tab === "Tools" ? (
        <ToolsHub />
      ) : tab === "Settings" ? (
        <Settings />
      ) : (
        <Onboarding onResult={setViewData} />
      )}

      <ChatAssistant scoreContext={viewData} liftForNav={isMobile} />
      {isMobile && (
        <BottomNav tabs={MANAGER_BOTTOM} active={tab} onSelect={(k) => { setTab(k); setViewData(null); }} />
      )}
    </div>
  );
}


// ─── Business Owner shell (/owner) ──────────────────────────────────────────
function OwnerShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [msmeTab, setMsmeTab] = useState("Check Eligibility");
  const [ownerResult, setOwnerResult] = useState(null);  // last generated score → chat context
  const doLogout = () => { logout(); navigate("/"); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", paddingBottom: isMobile ? 74 : 0 }}>
      <div style={{
        borderBottom: "1px solid var(--c-border-soft)", padding: "8px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", rowGap: 8,
        minHeight: 60, position: "sticky", top: 0, background: "var(--c-bg)", zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🏭</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)", lineHeight: 1 }}>FinHealth AI</div>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1 }}>Business Owner Portal</div>
          </div>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {["Check Eligibility", "Applications", "Tools", "Settings"].map((t) => (
              <button key={t} onClick={() => setMsmeTab(t)} style={navStyle(msmeTab === t)}>{t}</button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user && <div style={{ fontSize: 12, color: "#475569" }}>👤 {user.full_name || user.email}</div>}
          <ThemeToggle />
          <button onClick={doLogout} style={{
            background: "transparent", border: "1px solid #ef444433",
            color: "#ef4444", padding: "5px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer",
          }}>Logout</button>
        </div>
      </div>
      {msmeTab === "Tools" ? <ToolsHub /> : msmeTab === "Settings" ? <Settings /> : msmeTab === "Applications" ? <OwnerApplications /> : <MSMEPortal onBack={() => setMsmeTab("Check Eligibility")} onResult={setOwnerResult} />}
      <ChatAssistant scoreContext={ownerResult} liftForNav={isMobile} />
      {isMobile && (
        <BottomNav tabs={OWNER_BOTTOM} active={msmeTab} onSelect={setMsmeTab} />
      )}
    </div>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/demo/:scenario" element={<DemoPortal />} />
          <Route path="/owner/login" element={<AuthPage role="msme" />} />
          <Route path="/manager/login" element={<AuthPage role="banker" />} />
          <Route path="/owner/*" element={<RequireRole role="msme"><OwnerShell /></RequireRole>} />
          <Route path="/manager/*" element={<RequireRole role="banker"><ManagerShell /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
