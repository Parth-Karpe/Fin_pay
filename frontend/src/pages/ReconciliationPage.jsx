import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { FileCheck2, Info, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";

export function ReconciliationPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [month, setMonth] = useState("2026-11");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loadRuns = async () => {
    try {
      const data = await api.getReconciliationRuns();
      setRuns(data);
    } catch (err) {
      console.error("Failed to load reconciliation runs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const handleCreateRun = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createReconciliationRun({
        month,
        status: "COMPLETED",
        notes: notes.trim() || undefined
      });
      setSuccess(true);
      await loadRuns();
      setTimeout(() => {
        setSuccess(false);
        setShowAddModal(false);
        setNotes("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to create reconciliation run");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--dark)" }}>Monthly Reconciliation Records</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
            Operational audit log of monthly financial reconciliation executions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusCircle size={17} /> Record Monthly Run
        </button>
      </div>

      {/* Authoritative Architectural Notice */}
      <div className="alert alert-info" style={{ marginBottom: "2rem" }}>
        <Info size={22} style={{ flexShrink: 0 }} />
        <div>
          <strong>Authoritative Design Policy Notice (Reconciliation):</strong>
          <div style={{ marginTop: "0.25rem", fontSize: "0.85rem", lineHeight: 1.5 }}>
            As documented in the Lab 4 Detailed Design, external bank/gateway matching rules and dedicated administrative operator roles are explicitly pending approval. This module maintains the complete <code>RECONCILIATION_RUNS</code> record-management foundation (run ID, unique execution month, timestamp, status, audit notes) without assuming unsupported external integrations.
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "1.5rem", color: "var(--gray-500)" }}>Loading reconciliation runs...</p>
        ) : runs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
            <FileCheck2 size={48} color="var(--gray-300)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontWeight: "700", color: "var(--gray-700)" }}>No reconciliation runs recorded yet</h3>
            <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>Click "Record Monthly Run" to maintain a monthly execution log.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Reconciliation Month</th>
                  <th>Execution Timestamp</th>
                  <th>Status</th>
                  <th>Audit Notes</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.run_id}>
                    <td>
                      <span style={{ fontWeight: "700", color: "var(--gray-600)", fontFamily: "monospace" }}>
                        #{r.run_id}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: "0.85rem" }}>
                        {r.month}
                      </span>
                    </td>
                    <td style={{ color: "var(--gray-600)", fontSize: "0.85rem" }}>
                      {new Date(r.run_at).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-green">
                        {r.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--gray-700)", fontSize: "0.9rem" }}>
                      {r.notes || "Standard monthly audit pass"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Record Monthly Reconciliation</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: "var(--gray-400)", fontSize: "1.25rem" }}>
                ✕
              </button>
            </div>

            {success ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ margin: "0 auto 1rem" }} />
                <h4 style={{ fontWeight: "700", fontSize: "1.2rem" }}>Run Logged Successfully!</h4>
                <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>Reconciliation run preserved in database.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateRun}>
                {error && (
                  <div className="alert alert-error">
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <div>{error}</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Month (YYYY-MM)</label>
                  <input
                    type="text"
                    pattern="\d{4}-(0[1-9]|1[0-2])"
                    placeholder="YYYY-MM (e.g. 2026-11)"
                    className="form-input"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Notes</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Enter operational or audit notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.85rem" }}>
                  Submit Reconciliation Record
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
