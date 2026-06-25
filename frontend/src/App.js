import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import Landing from "./pages/Landing";
import MSMEPortal from "./pages/MSMEPortal";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import ScoreHistory from "./pages/ScoreHistory";
import Settings from "./pages/Settings";
import HealthCard from "./components/HealthCard";
import ChatAssistant from "./components/ChatAssistant";
import ToolsHub from "./pages/ToolsHub";

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


function BankerApp({ user, logout, onSwitchRole }) {
  const [tab, setTab] = useState("Dashboard");
  const [viewData, setViewData] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      <div style={{
        borderBottom: "1px solid #1e293b",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 60,
        position: "sticky", top: 0,
        background: "#0f172a",
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>📊</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>FinHealth AI</div>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1 }}>MSME Credit Intelligence</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {NAV_TABS.map((t) => (
            <button key={t} style={navStyle(tab === t)} onClick={() => { setTab(t); setViewData(null); }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: "#475569" }}>🏦 IDBI Bank</div>
          {user && <div style={{ fontSize: 12, color: "#475569" }}>👤 {user.full_name || user.email}</div>}
          <button onClick={onSwitchRole} style={{
            background: "transparent", border: "1px solid #334155",
            color: "#64748b", padding: "5px 12px", borderRadius: 8,
            fontSize: 11, cursor: "pointer",
          }}>← Switch Role</button>
          <button onClick={logout} style={{
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
              background: "transparent", border: "1px solid #334155",
              color: "#94a3b8", padding: "6px 14px", borderRadius: 8,
              fontSize: 12, cursor: "pointer",
            }}>← Back</button>
            <span style={{ color: "#64748b", fontSize: 13 }}>Financial Health Card</span>
          </div>
          <HealthCard data={viewData} />
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

      <ChatAssistant scoreContext={viewData} />
    </div>
  );
}

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [role, setRole] = useState(null);
  const [msmeTab, setMsmeTab] = useState("Check Eligibility");

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0f172a",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#475569", fontSize: 14,
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (!role) return <Landing onSelect={setRole} />;

  if (role === "msme") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a" }}>
        <div style={{
          borderBottom: "1px solid #1e293b", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 60, position: "sticky", top: 0, background: "#0f172a", zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>📊</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>FinHealth AI</div>
              <div style={{ fontSize: 10, color: "#475569", lineHeight: 1 }}>MSME Loan Eligibility</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Check Eligibility", "Tools", "Settings"].map((t) => (
              <button key={t} onClick={() => setMsmeTab(t)} style={navStyle(msmeTab === t)}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user && <div style={{ fontSize: 12, color: "#475569" }}>👤 {user.full_name || user.email}</div>}
            <button onClick={() => setRole(null)} style={{
              background: "transparent", border: "1px solid #334155",
              color: "#64748b", padding: "5px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer",
            }}>← Switch Role</button>
            <button onClick={logout} style={{
              background: "transparent", border: "1px solid #ef444433",
              color: "#ef4444", padding: "5px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer",
            }}>Logout</button>
          </div>
        </div>
        {msmeTab === "Tools" ? <ToolsHub /> : msmeTab === "Settings" ? <Settings /> : <MSMEPortal onBack={() => setRole(null)} />}
        <ChatAssistant />
      </div>
    );
  }

  return <BankerApp user={user} logout={logout} onSwitchRole={() => setRole(null)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
