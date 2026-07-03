import React, { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { register, login } from "../api/client";
import { useAuth } from "../context/AuthContext";

const ROLE_CONFIG = {
  msme: {
    accent: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    title: "Business Owner Portal",
    subtitle: "Unlock your financial potential instantly",
    icon: "🏭",
    color: "#10b981",
    home: "/owner",
  },
  banker: {
    accent: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    title: "Bank Manager Portal",
    subtitle: "AI-powered credit assessment & analysis",
    icon: "🏦",
    color: "#3b82f6",
    home: "/manager",
  },
};

export default function AuthPage({ role = "msme" }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.msme;
  const { user, saveSession } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (loggedIn.role !== role) {
        setError(loggedIn.role === "banker" ? "This is a Bank Manager account. Please use the Bank Manager login." : "This is a Business Owner account. Please use the Business Owner login.");
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
      background: "linear-gradient(180deg, #0f172a 0%, #1a1f3a 50%, #0f172a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "20px",
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
        repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(148, 163, 184, 0.03) 2px, rgba(148, 163, 184, 0.03) 4px)
      `,
    }}>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3), 0 20px 50px rgba(0, 0, 0, 0.3); } 50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.5), 0 20px 60px rgba(0, 0, 0, 0.4); } }
        .auth-form { animation: slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .auth-info { animation: slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .input-field { transition: all 0.3s ease; }
        .input-field:focus { border-color: var(--accent); background: rgba(16, 185, 129, 0.05); transform: translateY(-2px); }
        .submit-btn { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
        .tab-btn { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .tab-btn:hover { transform: translateY(-2px); }
        .icon-float { animation: float 3s ease-in-out infinite; }
        .icon-rotate { animation: rotate 20s linear infinite; opacity: 0.3; }
      `}</style>

      {/* Background Glows */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        background: `radial-gradient(circle, ${cfg.color}25 0%, transparent 70%)`,
        borderRadius: "50%",
        top: "-250px",
        left: "-250px",
        filter: "blur(80px)",
        zIndex: 0,
      }} />
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        background: `radial-gradient(circle, ${cfg.color}15 0%, transparent 70%)`,
        borderRadius: "50%",
        bottom: "-250px",
        right: "-250px",
        filter: "blur(80px)",
        zIndex: 0,
      }} />

      {/* Floating Icons */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        fontSize: 60,
        opacity: 0.2,
        animation: "float 4s ease-in-out infinite",
        zIndex: 0,
      }}>
        💼
      </div>
      <div style={{
        position: "absolute",
        top: "70%",
        right: "8%",
        fontSize: 50,
        opacity: 0.15,
        animation: "float 5s ease-in-out infinite 1s",
        zIndex: 0,
      }}>
        📊
      </div>
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "10%",
        fontSize: 45,
        opacity: 0.12,
        animation: "float 6s ease-in-out infinite 2s",
        zIndex: 0,
      }}>
        ✓
      </div>
      <div style={{
        position: "absolute",
        top: "30%",
        right: "5%",
        fontSize: 55,
        opacity: 0.15,
        animation: "float 4.5s ease-in-out infinite 1.5s",
        zIndex: 0,
      }}>
        🔒
      </div>

      {/* Main Container */}
      <div style={{
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: window.innerWidth < 1000 ? "1fr" : "1fr 1fr",
        gap: window.innerWidth < 1000 ? 40 : 80,
        maxWidth: 1300,
        width: "100%",
        alignItems: "center",
      }}>

        {/* LEFT: Info Section */}
        <div className="auth-info">
          {/* Professional Icon */}
          <div style={{
            width: 100,
            height: 100,
            margin: "0 auto 30px",
            animation: "float 3s ease-in-out infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {role === "banker" ? (
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke={cfg.color} strokeWidth="1.5">
                {/* Bank Building */}
                <rect x="15" y="35" width="70" height="50" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M50 15L75 35H25Z" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="30" y1="35" x2="30" y2="85" strokeLinecap="round"/>
                <line x1="50" y1="35" x2="50" y2="85" strokeLinecap="round"/>
                <line x1="70" y1="35" x2="70" y2="85" strokeLinecap="round"/>
                <rect x="20" y="45" width="10" height="15" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="45" y="45" width="10" height="15" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="70" y="45" width="10" height="15" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke={cfg.color} strokeWidth="1.5">
                {/* Factory/Industry */}
                <rect x="20" y="45" width="30" height="40" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="60" y="50" width="25" height="35" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M30 45V20M70 50V25" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"/>
                <circle cx="30" cy="55" r="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="40" cy="65" r="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="70" cy="60" r="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: window.innerWidth < 1000 ? 36 : 48,
            fontWeight: 900,
            color: "#f1f5f9",
            marginBottom: 16,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}>
            {cfg.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 16,
            color: "#94a3b8",
            marginBottom: 40,
            lineHeight: 1.6,
            maxWidth: 450,
          }}>
            {cfg.subtitle}
          </p>

          {/* Feature List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={cfg.color} strokeWidth="2">
                    <path d="M14 2v10M8 8l4.24 4.24M20 8l-4.24 4.24M14 26c6.627 0 12-5.373 12-12S20.627 2 14 2 2 7.373 2 14s5.373 12 12 12z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                label: "Instant Score",
                desc: "Get results in seconds"
              },
              {
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={cfg.color} strokeWidth="2">
                    <path d="M9 11v-6c0-1.105.895-2 2-2h6c1.105 0 2 .895 2 2v6M7 11h14v12c0 1.105-.895 2-2 2H9c-1.105 0-2-.895-2-2V11z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 14v6M17 14v6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                label: "Bank-Grade Security",
                desc: "RBI compliant encryption"
              },
              {
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={cfg.color} strokeWidth="2">
                    <path d="M4 8h20M4 8v12c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V8M4 8l2-3h16l2 3" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 12v8M14 12v8M20 12v8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                label: "AI Powered",
                desc: "Advanced ML analysis"
              },
              {
                svg: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={cfg.color} strokeWidth="2">
                    <path d="M24 7L10.5 20.5L4 14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                label: "Easy Process",
                desc: "Simple 3-step verification"
              },
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 16,
                padding: "16px 0",
                borderBottom: i < 3 ? "1px solid rgba(148, 163, 184, 0.2)" : "none",
                animation: `fadeInUp 0.6s ease-out ${0.2 + i * 0.1}s backwards`,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${cfg.color}15`,
                  border: `1px solid ${cfg.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {f.svg}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Badge */}
          <div style={{
            marginTop: 40,
            padding: "16px 20px",
            background: "rgba(148, 163, 184, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12,
            fontSize: 12,
            color: "#94a3b8",
            textAlign: "center",
            animation: "fadeInUp 0.8s ease-out 0.5s backwards",
          }}>
            🔒 Secured by RBI AA Framework • IDBI Innovate 2026
          </div>
        </div>

        {/* RIGHT: Login Form */}
        <div className="auth-form">
          {/* Card */}
          <div style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
            backdropFilter: "blur(20px)",
            border: `1.5px solid rgba(${cfg.color === "#10b981" ? "16, 185, 129" : "59, 130, 246"}, 0.3)`,
            borderRadius: 20,
            padding: 40,
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(${cfg.color === "#10b981" ? "16, 185, 129" : "59, 130, 246"}, 0.1)`,
            animation: `glow 3s ease-in-out infinite`,
            style: { "--accent": cfg.accent },
          }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: "inline-block",
                padding: "8px 16px",
                background: `${cfg.accent}20`,
                border: `1px solid ${cfg.accent}50`,
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color: cfg.accent,
                marginBottom: 16,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                {mode === "login" ? "Sign In" : "Create Account"}
              </div>
              <h2 style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#f1f5f9",
                margin: 0,
              }}>
                {mode === "login" ? "Welcome Back" : "Get Started"}
              </h2>
            </div>

            {/* Tab Toggle */}
            <div style={{
              display: "flex",
              background: "rgba(148, 163, 184, 0.1)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 32,
              gap: 4,
              border: "1px solid rgba(148, 163, 184, 0.2)",
            }}>
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className="tab-btn"
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: mode === m ? cfg.accent : "transparent",
                    color: mode === m ? "#ffffff" : "#94a3b8",
                    fontSize: 14,
                    fontWeight: mode === m ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {mode === "register" && (
                <div style={{ animation: "fadeInUp 0.5s ease-out" }}>
                  <label style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="7" cy="4" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12c0-2.21 2.239-4 5-4s5 1.79 5 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Full Name
                  </label>
                  <input
                    className="input-field"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#f1f5f9",
                      background: "rgba(15, 23, 42, 0.5)",
                      "--accent": cfg.accent,
                    }}
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                    placeholder="e.g. Priya Nair"
                  />
                </div>
              )}

              <div style={{ animation: "fadeInUp 0.5s ease-out 0.1s backwards" }}>
                <label style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="2" width="12" height="10" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 2l6 4 6-4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Email Address
                </label>
                <input
                  className="input-field"
                  type="email"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#f1f5f9",
                    background: "rgba(15, 23, 42, 0.5)",
                    "--accent": cfg.accent,
                  }}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div style={{ animation: "fadeInUp 0.5s ease-out 0.2s backwards" }}>
                <label style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="6" width="10" height="6" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 6V4c0-1.105.895-2 2-2s2 .895 2 2v2M10 6V4c0-1.105-.895-2-2-2s-2 .895-2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="7" cy="9" r="0.5" fill="currentColor"/>
                  </svg>
                  Password
                </label>
                <input
                  className="input-field"
                  type="password"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#f1f5f9",
                    background: "rgba(15, 23, 42, 0.5)",
                    "--accent": cfg.accent,
                  }}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>

              {mode === "register" && (
                <div style={{ animation: "fadeInUp 0.5s ease-out 0.3s backwards" }}>
                  <label style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 4L6 10L2 6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Confirm Password
                  </label>
                  <input
                    className="input-field"
                    type="password"
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      borderRadius: 12,
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      color: "#f1f5f9",
                      background: "rgba(15, 23, 42, 0.5)",
                      "--accent": cfg.accent,
                    }}
                    value={form.confirm_password}
                    onChange={(e) => set("confirm_password", e.target.value)}
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              )}

              {error && (
                <div style={{
                  padding: "12px 16px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#fca5a5",
                  fontWeight: 500,
                  animation: "fadeInUp 0.3s ease-out",
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 12,
                  border: "none",
                  background: loading ? "rgba(148, 163, 184, 0.2)" : cfg.accent,
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 8,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {loading ? "Processing..." : mode === "login" ? "Sign In →" : "Create Account →"}
              </button>
            </form>

            {/* Toggle Mode */}
            <div style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 13,
              color: "#94a3b8",
            }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                style={{
                  color: cfg.accent,
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.target.style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { e.target.style.textDecoration = "none"; }}
              >
                {mode === "login" ? "Register Now" : "Sign In"}
              </span>
            </div>
          </div>

          {/* Back Link */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link
              to="/"
              style={{
                color: "#94a3b8",
                fontSize: 12,
                textDecoration: "none",
                fontWeight: 600,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.target.style.color = cfg.accent; }}
              onMouseLeave={(e) => { e.target.style.color = "#94a3b8"; }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
