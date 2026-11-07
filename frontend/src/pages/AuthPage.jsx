import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

export function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        if (!fullName.trim()) {
          throw new Error("Please enter your full name.");
        }
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    setIsRegister(false);
    setEmail("student@finpay.edu");
    setPassword("password123");
    setError(null);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "#f1f5f9" }}>
      <div className="card" style={{ width: "100%", maxWidth: "440px", padding: "2.25rem", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="logo-badge" style={{ margin: "0 auto 1rem auto", width: "54px", height: "54px", borderRadius: "14px" }}>
            <GraduationCap size={30} />
          </div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: "800", color: "var(--dark)", letterSpacing: "-0.5px" }}>
            FinPay
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.92rem", marginTop: "0.35rem" }}>
            {isRegister ? "Set up your student wallet account" : "Sign in to manage wallet activity and campus payments"}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alex Mercer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Student Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. alex@student.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", marginTop: "0.5rem" }}
            disabled={submitting}
          >
            {submitting ? "Processing..." : isRegister ? (
              <>
                <UserPlus size={18} /> Register Student Account
              </>
            ) : (
              <>
                <LogIn size={18} /> Access Wallet
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            style={{ color: "var(--primary)", fontSize: "0.9rem", fontWeight: "600" }}
          >
            {isRegister ? "Already have an account? Sign in" : "New student? Create your wallet"}
          </button>
        </div>

        <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--gray-200)", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleQuickDemo}
            className="btn btn-secondary"
            style={{ width: "100%", fontSize: "0.85rem", padding: "0.55rem" }}
          >
            ⚡ Quick Demo Fill (Alex Mercer - $500.00)
          </button>
        </div>
      </div>
    </div>
  );
}
