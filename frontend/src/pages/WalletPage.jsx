import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Wallet, Shield, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";

export function WalletPage() {
  const { user, wallet, topUpWallet } = useAuth();
  const [topUpAmount, setTopUpAmount] = useState("50");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleTopUp = async (e) => {
    e.preventDefault();
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please enter a valid positive deposit amount.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await topUpWallet(amt);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err.message || "Failed to top up wallet.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--dark)" }}>Personal Student Wallet</h1>
        <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
          Secure, verified digital wallet linked 1:1 with your university student profile.
        </p>
      </div>

      <div className="grid-2">
        {/* Wallet Overview Card */}
        <div className="card" style={{ borderTop: "4px solid var(--primary)" }}>
          <div className="card-header">
            <h2 className="card-title">
              <Wallet size={20} color="var(--primary)" /> Wallet Overview
            </h2>
            <span className="badge badge-green">ACTIVE & VERIFIED</span>
          </div>

          <div style={{ padding: "1.5rem", background: "var(--gray-50)", borderRadius: "12px", marginBottom: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: "600" }}>
              Current Available Balance
            </div>
            <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--dark)", margin: "0.25rem 0" }}>
              ${wallet ? wallet.balance.toFixed(2) : "0.00"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--success)", fontWeight: "600" }}>
              Ready for campus transactions
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Wallet ID</span>
              <span style={{ fontWeight: "700" }}>#{wallet?.walletId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Student Profile</span>
              <span style={{ fontWeight: "700" }}>{user?.fullName} (#{user?.studentId})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Linked User Account</span>
              <span style={{ fontWeight: "700" }}>{user?.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Ownership Verification</span>
              <span style={{ color: "var(--success)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                <Shield size={14} /> Service-Layer Verified
              </span>
            </div>
          </div>
        </div>

        {/* Top-Up Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <PlusCircle size={20} color="var(--primary)" /> Add Funds to Wallet
            </h2>
          </div>

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <div>Funds successfully deposited into your wallet!</div>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleTopUp}>
            <div className="form-group">
              <label className="form-label">Amount ($ USD)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="form-input"
                placeholder="Enter deposit amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {[20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.5rem", fontSize: "0.85rem" }}
                  onClick={() => setTopUpAmount(amt.toString())}
                >
                  ${amt}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem" }}
              disabled={submitting}
            >
              {submitting ? "Processing Deposit..." : "Deposit Funds"}
            </button>
          </form>

          <div style={{ marginTop: "1.75rem", padding: "1rem", background: "var(--gray-50)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--gray-600)" }}>
            <strong>Financial Policy Note:</strong> In accordance with the approved Lab 4 Detailed Design, balances are maintained with exact decimal precision (NUMERIC 12,2) and safeguarded against race conditions through transactional locking.
          </div>
        </div>
      </div>
    </div>
  );
}
