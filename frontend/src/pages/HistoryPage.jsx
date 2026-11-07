import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { History, Receipt, Search, Filter, AlertCircle } from "lucide-react";

export function HistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await api.getPayments();
        setPayments(data);
      } catch (err) {
        console.error("Failed to load payment history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const filtered = payments.filter((p) =>
    p.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.payment_id.toString().includes(searchTerm)
  );

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--dark)" }}>Transaction History</h1>
        <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
          Full immutable audit record of all payments made from your student wallet.
        </p>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Search size={18} color="var(--gray-400)" />
          <input
            type="text"
            className="form-input"
            style={{ border: "none", boxShadow: "none", padding: "0.4rem 0" }}
            placeholder="Search by merchant name, category, or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p style={{ color: "var(--gray-500)" }}>Loading payment records...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <History size={48} color="var(--gray-300)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontWeight: "700", color: "var(--gray-700)" }}>No transactions found</h3>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
            {searchTerm ? "No payments match your search criteria." : "You have not made any payments yet."}
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Cashback</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.payment_id}>
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--gray-500)", fontFamily: "monospace" }}>
                        #{p.payment_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: "700", color: "var(--gray-900)" }}>{p.merchant_name}</div>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        {p.category_name || "Merchant"}
                      </span>
                    </td>
                    <td style={{ color: "var(--gray-600)", fontSize: "0.85rem" }}>
                      {new Date(p.paid_at).toLocaleString()}
                    </td>
                    <td>
                      {p.cashback ? (
                        <span className="badge badge-green">
                          +${parseFloat(p.cashback.amount).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--gray-400)", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className="amount-negative" style={{ fontSize: "1rem" }}>
                        -${parseFloat(p.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
