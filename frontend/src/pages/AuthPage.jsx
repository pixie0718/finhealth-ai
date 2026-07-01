import React, { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { register, login } from "../api/client";
import { useAuth } from "../context/AuthContext";

const inp = {
  width: "100%", background: "#0f172a", border: "1px solid #334155",
  borderRadius: 10, padding: "12px 16px", color: "#f1f5f9",
  fontSize: 14, outline: "none", boxSizing: "border-box",
};
const lbl = { fontSize: 11, color: "#64748b", marginBottom: 6, display: "block", letterSpacing: 0.5 };

// Per-role branding so /owner/login and /manager/login look like distinct pages.
const ROLE_CONFIG = {
  msme: {
    accent: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    glow: "#3b82f644",
    icon: "🏭",
    title: "Business Owner",
    subtitle: "Check your loan eligibility instantly",
    home: "/owner",
  },
  banker: {
    accent: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    glow: "#8b5cf644",
    icon: "🏦",
    title: "Bank Manager",
    subtitle: "Review AI-scored credit applications",
    home: "/manager",
  },
};

export default function AuthPage({ role = "msme" }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.msme;
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", password: "", full_name: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → send to the matching dashboard.
  if (user) {
    return <Navigate to={user.role === "banker" ? "/manager" : "/owner"} replace />;
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && form.password !== form.confirm_password) {
      setError("Passwords do not match"); return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    try {
      let res;
      if (mode === "register") {
        res = await register({ email: form.email, password: form.password, full_name: form.full_name, role });
      } else {
        res = await login(form.email, form.password);
      }
      const loggedIn = res.data.user;
      // A manager account can't sign into the owner portal and vice-versa.
      if (loggedIn.role !== role) {
        setError(
          loggedIn.role === "banker"
            ? "This is a Bank Manager account. Please use the Bank Manager login."
            : "This is a Business Owner account. Please use the Business Owner login."
        );
        setLoading(false);
        return;
      }
      saveSession(res.data.access_token, loggedIn);
      navigate(cfg.home, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 50% 0%, ${cfg.accent}33 0%, #0f172a 60%)`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Back to home */}
        <div style={{ marginBottom: 18 }}>
          <Link to="/" style={{ color: "#64748b", fontSize: 12, textDecoration: "none" }}>← Back to home</Link>
        </div>

        {/* Logo + role badge */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: "0 auto 14px",
            background: cfg.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: `0 0 40px ${cfg.glow}`,
          }}>{cfg.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>{cfg.title}</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>{cfg.subtitle}</div>
        </div>

        <div style={{
          background: "#1e293b", border: "1px solid #334155",
          borderRadius: 20, padding: 32,
        }}>
          {/* Tab toggle */}
          <div style={{ display: "flex", background: "#0f172a", borderRadius: 10, padding: 4, marginBottom: 28, gap: 4 }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                background: mode === m ? cfg.accent : "transparent",
                color: mode === m ? "#fff" : "#64748b",
                fontSize: 13, fontWeight: mode === m ? 600 : 400, cursor: "pointer",
                transition: "all 0.2s",
              }}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div>
                <label style={lbl}>FULL NAME</label>
                <input style={inp} value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder={role === "banker" ? "e.g. Priya Nair" : "e.g. Rajesh Sharma"} />
              </div>
            )}

            <div>
              <label style={lbl}>EMAIL ADDRESS *</label>
              <input style={inp} type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com" required />
            </div>

            <div>
              <label style={lbl}>PASSWORD *</label>
              <input style={inp} type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                placeholder="Min. 6 characters" required />
            </div>

            {mode === "register" && (
              <div>
                <label style={lbl}>CONFIRM PASSWORD *</label>
                <input style={inp} type="password" value={form.confirm_password}
                  onChange={(e) => set("confirm_password", e.target.value)}
                  placeholder="Re-enter password" required />
              </div>
            )}

            {error && (
              <div style={{
                padding: "10px 14px", background: "#dc262611", border: "1px solid #dc262633",
                borderRadius: 8, fontSize: 13, color: "#fca5a5",
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: "13px", borderRadius: 12, border: "none",
              background: loading ? "#334155" : cfg.accent,
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4, transition: "background 0.2s",
            }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#475569" }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{ color: cfg.accent, cursor: "pointer", fontWeight: 600 }}>
              {mode === "login" ? "Register" : "Sign In"}
            </span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#334155" }}>
          🔒 Secured by RBI AA Framework • IDBI Innovate 2026
        </div>
      </div>
    </div>
  );
}
