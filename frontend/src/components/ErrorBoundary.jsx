import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0a0f1e, #1a1f3a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            textAlign: "center",
            maxWidth: 500,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 24,
            padding: 40,
          }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                border: "none",
                color: "#fff",
                padding: "12px 28px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 15px #3b82f644",
              }}
            >
              🔄 Refresh Page
            </button>
            {process.env.NODE_ENV === "development" && (
              <details style={{ marginTop: 20, textAlign: "left" }}>
                <summary style={{ color: "#64748b", cursor: "pointer", fontSize: 12 }}>
                  Error Details (dev only)
                </summary>
                <pre style={{
                  background: "#0f172a",
                  padding: 12,
                  borderRadius: 8,
                  overflow: "auto",
                  fontSize: 10,
                  color: "#94a3b8",
                  marginTop: 10,
                }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
