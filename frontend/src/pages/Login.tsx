import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const DEMO_CREDENTIALS = [
  { role: "Admin", email: "admin@crm.local", pass: "Admin@12345" },
  { role: "Sales", email: "sales@crm.local", pass: "Sales@12345" },
  { role: "Warehouse", email: "warehouse@crm.local", pass: "Warehouse@12345" },
  { role: "Accounts", email: "accounts@crm.local", pass: "Accounts@12345" },
];

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-backdrop-glow" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">Operations Portal</div>
          <h1>Sign in to Mini ERP</h1>
          <p>Enter your internal employee credentials to continue</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sales@crm.local"
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-submit-btn"
          >
            {loading ? (
              <span className="btn-spinner">Authenticating...</span>
            ) : (
              "Sign In to Dashboard →"
            )}
          </button>
        </form>

        <div className="login-demo-section">
          <div className="demo-divider">
            <span>Quick Demo Login</span>
          </div>

          <div className="demo-chips">
            {DEMO_CREDENTIALS.map((demo) => (
              <button
                key={demo.role}
                type="button"
                className="demo-chip"
                onClick={() => handleQuickFill(demo.email, demo.pass)}
                title={`Click to fill ${demo.role} credentials`}
              >
                <span className="chip-role">{demo.role}</span>
                <span className="chip-email">{demo.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};