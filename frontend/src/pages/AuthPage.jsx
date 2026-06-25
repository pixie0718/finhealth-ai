import React, { useState } from "react";
import { register, login } from "../api/client";
import { useAuth } from "../context/AuthContext";

const inp = {
  width: "100%", background: "#0f172a", border: "1px solid #334155",
  borderRadius: 10, padding: "12px 16px", color: "#f1f5f9",
  fontSize: 14, outline: "none", boxSizing: "border-box",
};
const lbl = { fontSize: 11, color: "#64748b", marginBottom: 6, display: "block", letterSpacing: 0.5 };

export default function AuthPage() {
  const { saveSession } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [role, setRole] = useState("msme");
  const [form, setForm] = useState({ email: "", password: "", full_name: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      saveSession(res.data.access_token, res.data.user);
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "radial-gradient(ellipse at 50% 0%, #1e3a5f 0%, #0f172a 60%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16, margin: "0 auto 14px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, boxShadow: "0 0 40px #3b82f644",
          }}>📊</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>FinHealth AI</div>
          <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>MSME Credit Intelligence • IDBI Bank</div>
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
                background: mode === m ? "#3b82f6" : "transparent",
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
                  placeholder="e.g. Rajesh Sharma" />
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
              <>
                <div>
                  <label style={lbl}>CONFIRM PASSWORD *</label>
                  <input style={inp} type="password" value={form.confirm_password}
                    onChange={(e) => set("confirm_password", e.target.value)}
                    placeholder="Re-enter password" required />
                </div>

                <div>
                  <label style={lbl}>I AM A</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { key: "msme", icon: "🏭", label: "Business Owner" },
                      { key: "banker", icon: "🏦", label: "Bank Officer" },
                    ].map(({ key, icon, label }) => (
                      <button type="button" key={key} onClick={() => setRole(key)} style={{
                        padding: "12px 10px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${role === key ? "#3b82f6" : "#334155"}`,
                        background: role === key ? "#3b82f622" : "#0f172a",
                        color: role === key ? "#93c5fd" : "#64748b",
                        fontSize: 13, fontWeight: role === key ? 600 : 400,
                        transition: "all 0.2s",
                      }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
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
              background: loading ? "#334155" : "#3b82f6",
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
              style={{ color: "#3b82f6", cursor: "pointer", fontWeight: 600 }}>
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
