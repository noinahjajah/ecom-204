import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Admin ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, textAlign: "center" }}>
          <h2>⚠️ เกิดข้อผิดพลาด</h2>
          <pre style={{ color: "red", fontSize: 13, marginTop: 12, whiteSpace: "pre-wrap" }}>
            {this.state.error.message}
          </pre>
          <pre style={{ fontSize: 11, opacity: 0.7, marginTop: 8, whiteSpace: "pre-wrap" }}>
            {this.state.error.stack}
          </pre>
          <button
            className="admin-btn"
            style={{ marginTop: 16 }}
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            รีโหลด
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

