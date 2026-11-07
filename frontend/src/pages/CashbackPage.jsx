import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Gift, Info, CheckCircle2 } from "lucide-react";

export function CashbackPage() {
  const [cashbackRecords, setCashbackRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCashback() {
      try {
        const data = await api.getCashback();
        setCashbackRecords(data);
      } catch (err) {
        console.error("Failed to load cashback records:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCashback();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--dark)" }}>Cashback Management</h1>
        <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
          Authentic cashback rewards associated with eligible payments.
        </p>
      </div>

      {/* Authoritative Architectural Notice */}
      <div className="alert alert-info" style={{ marginBottom: "2rem" }}>
        <Info size={22} style={{ flexShrink: 0 }} />
        <div>
          <strong>Authoritative Design Constraint (Lab 4 Detailed Design):</strong>
          <div style={{ marginTop: "0.25rem", fontSize: "0.85rem", lineHeight: 1.5 }}>
            Specific cashback eligibility rules, percentages, and amount formulas remain an explicitly open question in the approved Lab 4 specification. The system provides complete database and entity support (<code>CASHBACK</code> linked 1:0..1 to <code>PAYMENTS</code>), while strictly prohibiting arbitrary or fabricated cashback awards until a formal policy is approved.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Gift size={20} color="var(--primary)" /> Recorded Cashback Rewards
          </h2>
        </div>

        {loading ? (
          <p style={{ color: "var(--gray-500)" }}>Loading cashback records...</p>
        ) : cashbackRecords.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
            <Gift size={48} color="var(--gray-300)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontWeight: "700", color: "var(--gray-700)" }}>No cashback records awarded yet</h3>
            <p style={{ color: "var(--gray-500)", maxWidth: "480px", margin: "0.5rem auto 0", fontSize: "0.9rem" }}>
              Per the approved business rules, no arbitrary cashback is generated for campus payments until an official university policy is confirmed.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cashback ID</th>
                  <th>Payment Ref</th>
                  <th>Reward Amount</th>
                  <th>Awarded At</th>
                </tr>
              </thead>
              <tbody>
                {cashbackRecords.map((c) => (
                  <tr key={c.cashback_id}>
                    <td>#{c.cashback_id}</td>
                    <td>Payment #{c.payment_id}</td>
                    <td>
                      <span className="amount-positive">+${parseFloat(c.amount).toFixed(2)}</span>
                    </td>
                    <td>{new Date(c.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
