import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { 
  CreditCard, 
  Store, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Receipt
} from "lucide-react";

export function PaymentPage({ preselectedMerchantId, setActiveTab }) {
  const { wallet, refreshWallet } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [merchantId, setMerchantId] = useState(preselectedMerchantId ? preselectedMerchantId.toString() : "");
  const [amount, setAmount] = useState("");
  const [loadingMerchants, setLoadingMerchants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    async function loadMerchants() {
      try {
        const data = await api.getMerchants();
        setMerchants(data);
        if (!merchantId && data.length > 0) {
          setMerchantId(data[0].merchant_id.toString());
        }
      } catch (err) {
        console.error("Failed to load merchants:", err);
      } finally {
        setLoadingMerchants(false);
      }
    }
    loadMerchants();
  }, []);

  useEffect(() => {
    if (preselectedMerchantId) {
      setMerchantId(preselectedMerchantId.toString());
    }
  }, [preselectedMerchantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    if (wallet && wallet.balance < parsedAmount) {
      setError(`Insufficient balance. Your wallet has $${wallet.balance.toFixed(2)}, but payment requires $${parsedAmount.toFixed(2)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payment = await api.createPayment({
        merchant_id: parseInt(merchantId, 10),
        amount: parsedAmount
      });
      await refreshWallet();
      setReceipt(payment);
    } catch (err) {
      setError(err.message || "Payment transaction failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMerchant = merchants.find((m) => m.merchant_id.toString() === merchantId);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--dark)" }}>Pay Campus Merchant</h1>
        <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
          Atomic instant settlement from your student wallet with zero fees.
        </p>
      </div>

      {receipt ? (
        <div className="card" style={{ padding: "2.5rem 2rem", textAlign: "center", borderTop: "4px solid var(--success)" }}>
          <div style={{ width: "64px", height: "64px", background: "var(--success-light)", color: "var(--success)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--dark)", marginBottom: "0.25rem" }}>
            Payment Successful!
          </h2>
          <p style={{ color: "var(--gray-500)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
            Transaction processed atomically and recorded to your payment history.
          </p>

          <div style={{ background: "var(--gray-50)", borderRadius: "12px", padding: "1.5rem", textAlign: "left", marginBottom: "2rem", border: "1px solid var(--gray-200)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Payment Reference</span>
              <span style={{ fontWeight: "700" }}>#{receipt.payment_id}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Merchant</span>
              <span style={{ fontWeight: "700" }}>{receipt.merchant_name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Category</span>
              <span style={{ fontWeight: "700" }}>{receipt.category_name || "General"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Amount Paid</span>
              <span style={{ fontWeight: "800", color: "var(--danger)", fontSize: "1.05rem" }}>
                -${parseFloat(receipt.amount).toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-200)", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Date & Time</span>
              <span style={{ fontWeight: "600" }}>{new Date(receipt.paid_at).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--gray-500)" }}>Remaining Balance</span>
              <span style={{ fontWeight: "800", color: "var(--success)" }}>
                ${wallet ? wallet.balance.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: "0.75rem" }}
              onClick={() => {
                setReceipt(null);
                setAmount("");
              }}
            >
              Make Another Payment
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: "0.75rem" }}
              onClick={() => setActiveTab("history")}
            >
              View Payment History
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "2rem" }}>
          {/* Balance Indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem", background: "var(--primary-light)", borderRadius: "10px", marginBottom: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: "600", textTransform: "uppercase" }}>
                Available Balance
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--dark)" }}>
                ${wallet ? wallet.balance.toFixed(2) : "0.00"}
              </div>
            </div>
            <button
              className="btn btn-white"
              style={{ fontSize: "0.85rem", padding: "0.45rem 0.85rem" }}
              onClick={() => setActiveTab("wallet")}
            >
              Top Up
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Merchant</label>
              {loadingMerchants ? (
                <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Loading merchants...</p>
              ) : (
                <select
                  className="form-select"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  required
                >
                  {merchants.map((m) => (
                    <option key={m.merchant_id} value={m.merchant_id}>
                      {m.name} ({m.category_name || "Campus Vendor"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount ($ USD)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Quick Amount Buttons */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {[5, 10, 20, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "0.45rem", fontSize: "0.85rem" }}
                  onClick={() => setAmount(amt.toFixed(2))}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {selectedMerchant && (
              <div style={{ padding: "0.85rem 1rem", background: "var(--gray-50)", borderRadius: "8px", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--gray-600)" }}>
                Paying <strong>{selectedMerchant.name}</strong> • Transaction will be debited instantly from Wallet #{wallet?.walletId}.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
              disabled={submitting || loadingMerchants}
            >
              {submitting ? "Processing Payment..." : (
                <>
                  <CreditCard size={18} /> Confirm & Pay Now
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
