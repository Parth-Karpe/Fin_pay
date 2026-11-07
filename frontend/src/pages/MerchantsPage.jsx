import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Store, Tag, ArrowRight, Search, AlertCircle } from "lucide-react";

export function MerchantsPage({ onSelectMerchantForPayment, setActiveTab }) {
  const [categories, setCategories] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, merchs] = await Promise.all([
          api.getCategories(),
          api.getMerchants(selectedCategory)
        ]);
        setCategories(cats);
        setMerchants(merchs);
      } catch (err) {
        console.error("Failed to load merchants:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory]);

  const filteredMerchants = merchants.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.category_name && m.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--dark)" }}>Campus Merchants</h1>
        <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>
          Approved campus dining, bookstore, pharmacy, printing, and service vendors accepting FinPay.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <Search size={18} color="var(--gray-400)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "38px" }}
              placeholder="Search merchants by name or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className={`btn ${selectedCategory === null ? "btn-primary" : "btn-secondary"}`}
              style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                className={`btn ${selectedCategory === cat.category_id ? "btn-primary" : "btn-secondary"}`}
                style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}
                onClick={() => setSelectedCategory(cat.category_id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Merchants Grid */}
      {loading ? (
        <p style={{ color: "var(--gray-500)" }}>Loading campus merchants...</p>
      ) : filteredMerchants.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <Store size={48} color="var(--gray-300)" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontWeight: "700", color: "var(--gray-700)" }}>No merchants found</h3>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem" }}>Try selecting another category or clearing your search.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredMerchants.map((m) => (
            <div key={m.merchant_id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Store size={22} />
                  </div>
                  <span className="badge badge-blue">
                    {m.category_name || "Merchant"}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--gray-900)", marginBottom: "0.35rem" }}>
                  {m.name}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
                  Merchant ID #{m.merchant_id} • Campus Partner
                </p>
              </div>

              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--gray-100)" }}>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", fontSize: "0.9rem", padding: "0.6rem" }}
                  onClick={() => {
                    onSelectMerchantForPayment(m.merchant_id);
                    setActiveTab("payment");
                  }}
                >
                  Pay Merchant <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
